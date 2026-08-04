const TRAINING_ENDPOINT = '/api/ncua-client-training-log';

const trainingState = {
  entriesByCharter: new Map(),
  selectedCharter: '',
  selectedName: '',
  loaded: false,
  loadError: '',
  saving: false
};

const elements = {
  tableBody: document.getElementById('client-table-body'),
  migrationStatus: document.getElementById('client-training-migration-status'),
  dialog: document.getElementById('client-training-dialog'),
  title: document.getElementById('client-training-dialog-title'),
  subtitle: document.getElementById('client-training-dialog-subtitle'),
  close: document.getElementById('client-training-close'),
  form: document.getElementById('client-training-form'),
  trainer: document.getElementById('client-training-trainer'),
  visitDate: document.getElementById('client-training-visit-date'),
  notes: document.getElementById('client-training-notes'),
  submit: document.getElementById('client-training-submit'),
  feedback: document.getElementById('client-training-feedback'),
  history: document.getElementById('client-training-history')
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

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return local.toISOString().slice(0, 10);
}

function rowCharter(row) {
  return normalizeCharterNumber(row?.dataset?.clientCharter);
}

function entriesFor(charterNumber) {
  return trainingState.entriesByCharter.get(normalizeCharterNumber(charterNumber)) || [];
}

function renderRow(row) {
  const charterNumber = rowCharter(row);
  const button = row.querySelector('[data-open-client-training]');
  const count = row.querySelector('[data-client-training-count]');
  if (!charterNumber || !button || !count) return;

  const entries = entriesFor(charterNumber);
  button.disabled = !trainingState.loaded;
  if (trainingState.loadError) {
    count.textContent = 'Unavailable';
    button.title = trainingState.loadError;
  } else if (!trainingState.loaded) {
    count.textContent = 'Loading…';
  } else {
    count.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
    button.title = `Open ${row.dataset.clientName || 'client'} training log`;
  }
}

function renderRows() {
  elements.tableBody?.querySelectorAll(':scope > tr').forEach(renderRow);
}

function setFeedback(message = '', state = '') {
  elements.feedback.textContent = message;
  elements.feedback.dataset.state = state;
}

function renderHistory() {
  const entries = entriesFor(trainingState.selectedCharter);
  if (!entries.length) {
    elements.history.innerHTML = '<div class="client-training-history-empty">No training updates have been saved for this client yet.</div>';
    return;
  }

  elements.history.innerHTML = entries.map((entry) => {
    const source = entry.source === 'legacy-accounts'
      ? '<span class="client-training-entry__source">Moved from Accounts</span>'
      : '';
    return `<article class="client-training-entry">
      <div class="client-training-entry__header"><div><span class="client-training-entry__trainer">${escapeHtml(entry.trainer || 'Team member')}</span>${source}</div><span class="client-training-entry__date">${escapeHtml(formatDate(entry.visitDate))}</span></div>
      <p class="client-training-entry__notes">${escapeHtml(entry.notes)}</p>
    </article>`;
  }).join('');
}

function openTrainingLog(row) {
  const charterNumber = rowCharter(row);
  if (!charterNumber || !trainingState.loaded) return;

  trainingState.selectedCharter = charterNumber;
  trainingState.selectedName = row.dataset.clientName || row.querySelector('.client-name')?.textContent?.trim() || 'Client';
  elements.title.textContent = trainingState.selectedName;
  elements.subtitle.textContent = `Charter ${charterNumber}`;
  elements.form.reset();
  elements.visitDate.value = todayInputValue();
  setFeedback();
  renderHistory();
  elements.dialog.showModal();
}

function closeTrainingLog() {
  if (elements.dialog.open) elements.dialog.close();
}

function renderMigrationStatus(migration = {}) {
  const unmatched = Array.isArray(migration.unmatchedAccounts) ? migration.unmatchedAccounts : [];
  const unmatchedEntries = unmatched.reduce((total, account) => total + Number(account?.entryCount || 0), 0);
  if (!unmatchedEntries) {
    elements.migrationStatus.hidden = true;
    elements.migrationStatus.textContent = '';
    return;
  }

  const names = unmatched.map((account) => account.accountName).filter(Boolean).join(', ');
  elements.migrationStatus.hidden = false;
  elements.migrationStatus.textContent = `${unmatchedEntries} legacy training ${unmatchedEntries === 1 ? 'entry needs' : 'entries need'} a client match before migration${names ? `: ${names}` : '.'}`;
}

async function loadTrainingLogs() {
  trainingState.loaded = false;
  trainingState.loadError = '';
  renderRows();
  try {
    const response = await fetch(TRAINING_ENDPOINT, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);

    trainingState.entriesByCharter = new Map(
      (Array.isArray(body.accounts) ? body.accounts : [])
        .map((account) => [normalizeCharterNumber(account?.charterNumber), Array.isArray(account?.entries) ? account.entries : []])
        .filter(([charterNumber]) => charterNumber)
    );
    trainingState.loaded = true;
    renderMigrationStatus(body.migration);
  } catch (error) {
    trainingState.loadError = error.message || 'Unable to load training logs.';
    elements.migrationStatus.hidden = false;
    elements.migrationStatus.textContent = trainingState.loadError;
  }
  renderRows();
}

async function saveTrainingUpdate(event) {
  event.preventDefault();
  if (trainingState.saving || !trainingState.selectedCharter) return;

  const trainer = elements.trainer.value;
  const visitDate = elements.visitDate.value;
  const notes = elements.notes.value.trim();
  if (!trainer || !visitDate || !notes) {
    setFeedback('Select a team member, visit date, and enter the training update.', 'error');
    return;
  }

  trainingState.saving = true;
  elements.submit.disabled = true;
  elements.submit.textContent = 'Saving…';
  setFeedback('Saving to MongoDB…');
  try {
    const response = await fetch(`${TRAINING_ENDPOINT}/${encodeURIComponent(trainingState.selectedCharter)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trainer, visitDate, notes })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);

    trainingState.entriesByCharter.set(trainingState.selectedCharter, Array.isArray(body.entries) ? body.entries : []);
    elements.notes.value = '';
    setFeedback('Training update saved.', 'saved');
    renderHistory();
    renderRows();
  } catch (error) {
    setFeedback(error.message || 'Unable to save the training update.', 'error');
  } finally {
    trainingState.saving = false;
    elements.submit.disabled = false;
    elements.submit.textContent = 'Save Training Update';
  }
}

elements.tableBody?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-client-training]');
  if (!button) return;
  const row = button.closest('tr');
  if (row) openTrainingLog(row);
});

elements.close?.addEventListener('click', closeTrainingLog);
elements.dialog?.addEventListener('click', (event) => {
  if (event.target === elements.dialog) closeTrainingLog();
});
elements.form?.addEventListener('submit', saveTrainingUpdate);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.dialog?.open) closeTrainingLog();
});

if (elements.tableBody) {
  const observer = new MutationObserver(renderRows);
  observer.observe(elements.tableBody, { childList: true });
}

renderRows();
loadTrainingLogs();
