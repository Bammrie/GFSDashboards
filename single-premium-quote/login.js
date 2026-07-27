const STATE_LINKS = {
  MO: {
    name: 'Missouri',
    description: 'Open the Missouri CSO rate and coverage program.',
    href: 'missouri/'
  },
  AR: {
    name: 'Arkansas',
    description: 'Open the Arkansas CSO rate and coverage program.',
    href: 'arkansas/'
  }
};

const elements = {
  loginPanel: document.getElementById('login-panel'),
  loginForm: document.getElementById('quote-login-form'),
  loginStatus: document.getElementById('quote-login-status'),
  stateGateway: document.getElementById('state-gateway'),
  stateLinks: document.getElementById('state-links'),
  gatewayWelcome: document.getElementById('gateway-welcome'),
  adminLinkContainer: document.getElementById('admin-link-container'),
  logout: document.getElementById('gateway-logout')
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

function setStatus(message, isError = false) {
  elements.loginStatus.textContent = message;
  elements.loginStatus.classList.toggle('sp-status--error', isError);
}

function allowedStates(user) {
  return user.role === 'admin' ? Object.keys(STATE_LINKS) : user.authorizedStates || [];
}

function safeReturnTo(user) {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '';
  const paths = {
    '/single-premium-quote/missouri/': 'MO',
    '/single-premium-quote/arkansas/': 'AR',
    '/single-premium-quote/admin/': 'admin'
  };
  const requirement = paths[returnTo];
  if (!requirement) return '';
  if (requirement === 'admin') return user.role === 'admin' ? returnTo : '';
  return allowedStates(user).includes(requirement) ? returnTo : '';
}

function showGateway(user, allowRedirect = true) {
  const returnTo = allowRedirect ? safeReturnTo(user) : '';
  if (returnTo) {
    window.location.replace(returnTo);
    return;
  }

  elements.loginPanel.hidden = true;
  elements.stateGateway.hidden = false;
  elements.gatewayWelcome.textContent = `Signed in as ${user.displayName || user.username}.`;
  elements.adminLinkContainer.hidden = user.role !== 'admin';
  elements.stateLinks.replaceChildren();

  for (const state of allowedStates(user)) {
    const stateInfo = STATE_LINKS[state];
    if (!stateInfo) continue;
    const link = document.createElement('a');
    link.className = 'sp-state-gateway-card';
    link.href = stateInfo.href;

    const abbreviation = document.createElement('span');
    abbreviation.className = 'sp-state-gateway-card__abbr';
    abbreviation.textContent = state;
    const copy = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = `${stateInfo.name} Quotes`;
    const description = document.createElement('small');
    description.textContent = stateInfo.description;
    copy.append(title, description);
    link.append(abbreviation, copy);
    elements.stateLinks.append(link);
  }

  if (!elements.stateLinks.children.length) {
    const empty = document.createElement('p');
    empty.className = 'sp-empty-note';
    empty.textContent = 'Your account does not have a state assigned yet. Contact an administrator.';
    elements.stateLinks.append(empty);
  }
}

elements.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Signing in…');
  const formData = new FormData(elements.loginForm);
  try {
    const { user } = await apiJson('/api/quote-app/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });
    elements.loginForm.reset();
    setStatus('');
    showGateway(user);
  } catch (error) {
    setStatus(error.message, true);
  }
});

elements.logout.addEventListener('click', async () => {
  try {
    await apiJson('/api/quote-app/auth/logout', { method: 'POST', body: '{}' });
  } finally {
    window.location.assign('/single-premium-quote/');
  }
});

apiJson('/api/quote-app/auth/me')
  .then(({ user }) => showGateway(user))
  .catch((error) => {
    if (error.status !== 401) setStatus(error.message, true);
  });
