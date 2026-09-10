const rows = document.getElementById('daily-rows');
const days = document.getElementById('days');
const refresh = document.getElementById('refresh');
const status = document.getElementById('status');
const errorBox = document.getElementById('error');
const number = (value) => value == null ? '—' : value.toLocaleString();
const dateLabel = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
  timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'
});

async function loadUsage() {
  refresh.disabled = true;
  days.disabled = true;
  status.textContent = 'Loading visitor log…';
  errorBox.hidden = true;
  try {
    const response = await fetch(`/api/quote-usage/daily?days=${days.value}`, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(response.status === 401
      ? 'Sign in with the existing dashboard credentials to view this log.'
      : 'Visitor reporting is temporarily unavailable. Missing data does not mean there were zero visitors.');
    const data = await response.json();
    const yesterday = data.daily[1];
    document.getElementById('mo-count').textContent = number(yesterday?.missouri.uniqueBrowsers);
    document.getElementById('ar-count').textContent = number(yesterday?.arkansas.uniqueBrowsers);
    document.getElementById('all-count').textContent = number(yesterday?.combined.uniqueBrowsers);
    rows.replaceChildren();
    for (const entry of data.daily) {
      const row = document.createElement('tr');
      const date = document.createElement('td');
      date.textContent = dateLabel(entry.day);
      if (!entry.tracked || entry.partialDay) {
        const note = document.createElement('small');
        note.textContent = !entry.tracked ? 'Not yet tracked' : 'Partial day';
        date.append(note);
      }
      row.append(date);
      for (const program of ['missouri', 'arkansas', 'combined']) {
        for (const metric of ['uniqueBrowsers', 'pageViews']) {
          const cell = document.createElement('td');
          cell.textContent = number(entry[program][metric]);
          row.append(cell);
        }
      }
      rows.append(row);
    }
    document.getElementById('tracking-start').textContent = `Tracking began ${new Date(data.trackingStartedAt).toLocaleString('en-US', { timeZone: data.timezone, timeZoneName: 'short' })}. Earlier visitor history is unavailable.`;
    status.textContent = `Updated ${new Date(data.generatedAt).toLocaleTimeString('en-US', { timeZone: data.timezone, timeZoneName: 'short' })}`;
    if (data.health.recordingErrorsSinceRestart > 0) {
      errorBox.textContent = 'Some visits could not be saved because of a reporting storage error. Counts may be incomplete; the calculators were unaffected.';
      errorBox.hidden = false;
    }
  } catch (error) {
    status.textContent = 'Update failed; any previously displayed data is from the last successful refresh.';
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    refresh.disabled = false;
    days.disabled = false;
  }
}

refresh.addEventListener('click', loadUsage);
days.addEventListener('change', loadUsage);
loadUsage();
