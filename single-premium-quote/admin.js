const STATE_NAMES = { MO: 'Missouri', AR: 'Arkansas' };
const LOAN_TYPES = [
  ['interest_only', 'Interest Only'],
  ['variable_rate', 'Variable Rate'],
  ['first_mortgage', '1st Mortgage']
];

const elements = {
  adminUserName: document.getElementById('admin-user-name'),
  logout: document.getElementById('admin-logout'),
  screenButtons: document.querySelectorAll('[data-admin-screen]'),
  screens: document.querySelectorAll('[data-admin-panel]'),
  createUserForm: document.getElementById('create-user-form'),
  createUserStatus: document.getElementById('create-user-status'),
  usersList: document.getElementById('users-list'),
  programConfigList: document.getElementById('program-config-list')
};

async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'Unable to complete the request.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('sp-status--error', isError);
}

function fieldValue(form, name) {
  return form.elements[name]?.value ?? '';
}

function checkedValues(form, name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
}

function setAdminScreen(name) {
  elements.screens.forEach((screen) => {
    screen.hidden = screen.dataset.adminPanel !== name;
  });
  elements.screenButtons.forEach((button) => {
    if (button.dataset.adminScreen === name) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function userCard(user) {
  const states = user.role === 'admin' ? ['MO', 'AR'] : user.authorizedStates;
  return `
    <form class="sp-config-card sp-user-card" data-user-id="${escapeHtml(user.id)}">
      <div class="sp-section-header">
        <div>
          <span class="sp-badge">${user.role === 'admin' ? 'Administrator' : 'Quote User'}</span>
          <h3>${escapeHtml(user.displayName)}</h3>
          <p class="sp-footer-note">Last sign in: ${user.lastLoginAt ? escapeHtml(new Date(user.lastLoginAt).toLocaleString()) : 'Never'}</p>
        </div>
        <label class="sp-checkbox sp-active-toggle">
          <input type="checkbox" name="active" ${user.active ? 'checked' : ''} />
          Active
        </label>
      </div>
      <div class="sp-field-grid">
        <label class="sp-field">
          <span>Display Name</span>
          <input name="displayName" value="${escapeHtml(user.displayName)}" maxlength="120" required />
        </label>
        <label class="sp-field">
          <span>Username</span>
          <input name="username" value="${escapeHtml(user.username)}" minlength="3" maxlength="80" required />
        </label>
        <label class="sp-field">
          <span>Role</span>
          <select name="role">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Quote User</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
          </select>
        </label>
        <label class="sp-field">
          <span>New Password (optional)</span>
          <input name="password" type="password" minlength="10" autocomplete="new-password" />
        </label>
      </div>
      <fieldset class="sp-checkbox-group">
        <legend>Authorized States</legend>
        <label class="sp-checkbox"><input type="checkbox" name="authorizedStates" value="MO" ${states.includes('MO') ? 'checked' : ''} /> Missouri</label>
        <label class="sp-checkbox"><input type="checkbox" name="authorizedStates" value="AR" ${states.includes('AR') ? 'checked' : ''} /> Arkansas</label>
      </fieldset>
      <div class="sp-actions">
        <button type="submit" class="sp-button sp-button--primary">Save User</button>
      </div>
      <p class="sp-status" role="status"></p>
    </form>
  `;
}

async function loadUsers() {
  const { users } = await apiJson('/api/quote-app/admin/users');
  elements.usersList.innerHTML = users.map(userCard).join('');
  elements.usersList.querySelectorAll('[data-user-id]').forEach((form) => {
    form.addEventListener('submit', saveUser);
  });
}

async function saveUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.sp-status');
  setStatus(status, 'Saving…');
  const payload = {
    displayName: fieldValue(form, 'displayName'),
    username: fieldValue(form, 'username'),
    role: fieldValue(form, 'role'),
    authorizedStates: checkedValues(form, 'authorizedStates'),
    active: form.elements.active.checked
  };
  if (fieldValue(form, 'password')) payload.password = fieldValue(form, 'password');

  try {
    await apiJson(`/api/quote-app/admin/users/${form.dataset.userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await loadUsers();
  } catch (error) {
    setStatus(status, error.message, true);
  }
}

function disabilityRatesText(config) {
  const rates = config.rateConfig.disabilityRatesPer100.sevenDayRetro || {};
  return Array.from({ length: config.limits.maxProtectedTermMonths }, (_, index) => rates[index + 1] ?? '').join(', ');
}

function configCard(config) {
  const state = config.state;
  const life = config.rateConfig.lifeRatesPer100PerYear;
  const limits = config.limits;
  const unsupported = limits.unsupportedLoanTypes || [];
  return `
    <form class="sp-config-card sp-program-card" data-config-state="${state}">
      <div class="sp-section-header">
        <div>
          <span class="sp-badge">${state}</span>
          <h3>${escapeHtml(STATE_NAMES[state])} Program</h3>
          <p class="sp-footer-note">Last updated: ${config.updatedAt ? escapeHtml(new Date(config.updatedAt).toLocaleString()) : 'Default profile'}</p>
        </div>
        <button type="button" class="sp-button sp-button--secondary sp-button--compact" data-reset-config>Restore Defaults</button>
      </div>

      <h4>Display</h4>
      <div class="sp-field-grid">
        <label class="sp-field"><span>Organization Name</span><input name="organizationName" value="${escapeHtml(config.organizationName)}" required /></label>
        <label class="sp-field"><span>Program Name</span><input name="programName" value="${escapeHtml(config.programName)}" required /></label>
        <label class="sp-field"><span>Loan Class</span><input name="loanClass" value="${escapeHtml(config.rateConfig.loanClass)}" required /></label>
      </div>
      <label class="sp-field"><span>Quote Disclaimer</span><textarea name="disclaimer" rows="3" required>${escapeHtml(config.disclaimer)}</textarea></label>

      <h4>Life Rates per $100 per Year</h4>
      <div class="sp-field-grid">
        <label class="sp-field"><span>Single Decreasing</span><input name="singleDecreasing" type="number" min="0" max="100" step="0.000001" value="${life.singleDecreasing}" required /></label>
        <label class="sp-field"><span>Joint Decreasing</span><input name="jointDecreasing" type="number" min="0" max="100" step="0.000001" value="${life.jointDecreasing}" required /></label>
        <label class="sp-field"><span>Single Level</span><input name="singleLevel" type="number" min="0" max="100" step="0.000001" value="${life.singleLevel}" required /></label>
        <label class="sp-field"><span>Joint Level</span><input name="jointLevel" type="number" min="0" max="100" step="0.000001" value="${life.jointLevel}" required /></label>
        <label class="sp-field"><span>Gross Factor Worksheet Adjustment</span><input name="grossFactorWorksheetAdjustment" type="number" min="0" max="1" step="0.000000000001" value="${config.rateConfig.grossFactorWorksheetAdjustment}" required /></label>
      </div>

      <h4>Coverage Limits</h4>
      <div class="sp-field-grid">
        <label class="sp-field"><span>Maximum Protected Loan Amount</span><input name="maxProtectedLoanAmount" type="number" min="1" step="0.01" value="${limits.maxProtectedLoanAmount}" required /></label>
        <label class="sp-field"><span>Maximum Protected Term (months)</span><input name="maxProtectedTermMonths" type="number" min="1" max="120" step="1" value="${limits.maxProtectedTermMonths}" required /></label>
        <label class="sp-field"><span>Maximum Issue Age</span><input name="maxIssueAge" type="number" min="18" max="100" step="1" value="${limits.maxIssueAge}" required /></label>
        <label class="sp-field"><span>Maximum Age at Maturity</span><input name="maxAgeAtMaturity" type="number" min="18" max="120" step="1" value="${limits.maxAgeAtMaturity}" required /></label>
        <label class="sp-field"><span>Maximum Monthly Disability Benefit</span><input name="maxMonthlyDisabilityBenefit" type="number" min="0" step="0.01" value="${limits.maxMonthlyDisabilityBenefit}" required /></label>
        <label class="sp-field"><span>Minimum Employment Hours per Week</span><input name="minimumDisabilityHoursPerWeek" type="number" min="0" max="168" step="0.01" value="${limits.minimumDisabilityHoursPerWeek}" required /></label>
        <label class="sp-field"><span>Minimum Premium</span><input name="minimumPremium" type="number" min="0" step="0.01" value="${limits.minimumPremium}" required /></label>
      </div>

      <fieldset class="sp-checkbox-group">
        <legend>Unsupported Loan Types</legend>
        ${LOAN_TYPES.map(([value, label]) => `<label class="sp-checkbox"><input type="checkbox" name="unsupportedLoanTypes" value="${value}" ${unsupported.includes(value) ? 'checked' : ''} /> ${label}</label>`).join('')}
      </fieldset>

      <label class="sp-field">
        <span>7-Day Retro Disability Rates per $100</span>
        <textarea name="disabilityRates" rows="9" spellcheck="false" required>${escapeHtml(disabilityRatesText(config))}</textarea>
        <small>Comma-separated monthly rates, beginning with month 1. Enter one rate for each protected month.</small>
      </label>

      <div class="sp-actions">
        <button type="submit" class="sp-button sp-button--primary">Save ${escapeHtml(STATE_NAMES[state])} Variables</button>
      </div>
      <p class="sp-status" role="status"></p>
    </form>
  `;
}

async function loadConfigs() {
  const { configs } = await apiJson('/api/quote-app/admin/configs');
  elements.programConfigList.innerHTML = configs.map(configCard).join('');
  elements.programConfigList.querySelectorAll('[data-config-state]').forEach((form) => {
    form.addEventListener('submit', saveConfig);
    form.querySelector('[data-reset-config]').addEventListener('click', () => resetConfig(form));
  });
}

function numeric(form, name) {
  return Number(fieldValue(form, name));
}

async function saveConfig(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.sp-status');
  const rates = fieldValue(form, 'disabilityRates')
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  const maxMonths = numeric(form, 'maxProtectedTermMonths');
  if (rates.length !== maxMonths || rates.some((rate) => !Number.isFinite(rate) || rate < 0)) {
    setStatus(status, `Enter exactly ${maxMonths} valid disability rates.`, true);
    return;
  }
  setStatus(status, 'Saving…');
  const config = {
    organizationName: fieldValue(form, 'organizationName'),
    programName: fieldValue(form, 'programName'),
    disclaimer: fieldValue(form, 'disclaimer'),
    rateConfig: {
      loanClass: fieldValue(form, 'loanClass'),
      grossFactorWorksheetAdjustment: numeric(form, 'grossFactorWorksheetAdjustment'),
      lifeRatesPer100PerYear: {
        singleDecreasing: numeric(form, 'singleDecreasing'),
        jointDecreasing: numeric(form, 'jointDecreasing'),
        singleLevel: numeric(form, 'singleLevel'),
        jointLevel: numeric(form, 'jointLevel')
      },
      disabilityRatesPer100: { sevenDayRetro: rates }
    },
    limits: {
      maxProtectedLoanAmount: numeric(form, 'maxProtectedLoanAmount'),
      maxProtectedTermMonths: maxMonths,
      maxIssueAge: numeric(form, 'maxIssueAge'),
      maxAgeAtMaturity: numeric(form, 'maxAgeAtMaturity'),
      maxMonthlyDisabilityBenefit: numeric(form, 'maxMonthlyDisabilityBenefit'),
      minimumDisabilityHoursPerWeek: numeric(form, 'minimumDisabilityHoursPerWeek'),
      minimumPremium: numeric(form, 'minimumPremium'),
      unsupportedLoanTypes: checkedValues(form, 'unsupportedLoanTypes')
    }
  };
  try {
    await apiJson(`/api/quote-app/admin/configs/${form.dataset.configState}`, {
      method: 'PUT',
      body: JSON.stringify({ config })
    });
    await loadConfigs();
  } catch (error) {
    setStatus(status, error.message, true);
  }
}

async function resetConfig(form) {
  if (!window.confirm(`Restore the ${STATE_NAMES[form.dataset.configState]} carrier defaults?`)) return;
  const status = form.querySelector('.sp-status');
  setStatus(status, 'Restoring defaults…');
  try {
    await apiJson(`/api/quote-app/admin/configs/${form.dataset.configState}/reset`, {
      method: 'POST',
      body: '{}'
    });
    await loadConfigs();
  } catch (error) {
    setStatus(status, error.message, true);
  }
}

elements.screenButtons.forEach((button) => {
  button.addEventListener('click', () => setAdminScreen(button.dataset.adminScreen));
});

elements.createUserForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(elements.createUserStatus, 'Creating account…');
  const form = elements.createUserForm;
  try {
    await apiJson('/api/quote-app/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        displayName: fieldValue(form, 'displayName'),
        username: fieldValue(form, 'username'),
        password: fieldValue(form, 'password'),
        role: fieldValue(form, 'role'),
        authorizedStates: checkedValues(form, 'authorizedStates')
      })
    });
    form.reset();
    form.querySelector('input[value="MO"]').checked = true;
    setStatus(elements.createUserStatus, 'Account created.');
    await loadUsers();
  } catch (error) {
    setStatus(elements.createUserStatus, error.message, true);
  }
});

elements.logout.addEventListener('click', async () => {
  try {
    await apiJson('/api/quote-app/auth/logout', { method: 'POST', body: '{}' });
  } finally {
    window.location.assign('/single-premium-quote/');
  }
});

async function initialize() {
  try {
    const { user } = await apiJson('/api/quote-app/auth/me');
    if (user.role !== 'admin') {
      window.location.replace('/single-premium-quote/');
      return;
    }
    elements.adminUserName.textContent = user.displayName || user.username;
    await Promise.all([loadUsers(), loadConfigs()]);
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      window.location.replace('/single-premium-quote/?returnTo=%2Fsingle-premium-quote%2Fadmin%2F');
      return;
    }
    elements.usersList.innerHTML = `<div class="sp-alert sp-alert--error">${escapeHtml(error.message)}</div>`;
  }
}

initialize();
