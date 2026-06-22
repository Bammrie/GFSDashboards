const data = window.POTENTIAL_NEW_CLIENT_DATA || { prospects: [] };
const prospects = Array.isArray(data.prospects) ? data.prospects : [];
let selectedProspectId = prospects[0]?.id || null;
let map;
let markerGroup;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const stateNames = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
  PR: 'Puerto Rico',
  VI: 'U.S. Virgin Islands',
  GU: 'Guam'
};

function getElement(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  return Number.isFinite(value) ? currencyFormatter.format(value) : '-';
}

function formatNumber(value) {
  return Number.isFinite(value) ? numberFormatter.format(value) : '-';
}

function formatPercent(value) {
  return Number.isFinite(value) ? percentFormatter.format(value) : '-';
}

function formatRate(value) {
  return Number.isFinite(value) ? `${decimalFormatter.format(value)}%` : '-';
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function normalizeStateCode(value) {
  const text = String(value || '').trim();
  return /^[A-Za-z]{2}$/.test(text) ? text.toUpperCase() : text;
}

function getProspectState(prospect) {
  return normalizeStateCode(
    prospect?.callReport?.creditUnionProfile?.state ||
      prospect?.callReport?.creditUnionState ||
      prospect?.profile?.mainOffice?.state ||
      prospect?.profile?.charterState ||
      'Unknown'
  );
}

function getStateLabel(stateCode) {
  const code = normalizeStateCode(stateCode);
  return stateNames[code] ? `${stateNames[code]} (${code})` : code || 'Unknown';
}

function getProspectsByState() {
  const groups = new Map();
  prospects.forEach((prospect) => {
    const state = getProspectState(prospect);
    if (!groups.has(state)) groups.set(state, []);
    groups.get(state).push(prospect);
  });
  return [...groups.entries()]
    .map(([state, items]) => ({
      state,
      items,
      indirectBalance: items.reduce((sum, prospect) => sum + (prospect.callReport?.indirectTotals?.amount || 0), 0)
    }))
    .sort((a, b) => getStateLabel(a.state).localeCompare(getStateLabel(b.state)));
}

function setText(id, value) {
  const element = getElement(id);
  if (element) {
    element.textContent = value;
  }
}

function getSelectedProspect() {
  return prospects.find((prospect) => prospect.id === selectedProspectId) || prospects[0] || null;
}

function getConnectionRequests(prospect) {
  const requests = prospect?.relationshipResearch?.connectionRequests;
  return Array.isArray(requests) ? requests : [];
}

function getAllConnectionRequests() {
  return prospects.flatMap((prospect) =>
    getConnectionRequests(prospect).map((request) => ({ ...request, prospectName: prospect.name }))
  );
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isAcceptedConnectionRequest(request) {
  return Boolean(request?.acceptedAt || String(request?.status || '').toLowerCase() === 'accepted');
}

function findConnectionRequestForLead(lead, research) {
  const requests = Array.isArray(research?.connectionRequests) ? research.connectionRequests : [];
  const leadName = normalizeName(lead?.name);
  return requests.find((request) => normalizeName(request.name) === leadName) || null;
}

function formatConnectionStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'accepted') return '\u2713 Accepted';
  if (normalized === 'requested' || normalized === 'pending') return 'Requested';
  if (normalized === 'blocked') return 'Blocked';
  if (normalized === 'already_connected') return '\u2713 Already connected';
  return status || '-';
}

function formatLeadConnectionStatus(lead, research) {
  const request = findConnectionRequestForLead(lead, research);
  const status = request?.status || lead?.connectionStatus || lead?.connectionRequest?.status;
  if (!status) return '-';
  const label = formatConnectionStatus(status);
  if (request?.acceptedAt) return `${label} ${formatDate(request.acceptedAt)}`;
  if (request?.requestedAt) return `${label} ${formatDate(request.requestedAt)}`;
  return label;
}

function renderMetricGrid(id, metrics) {
  const element = getElement(id);
  if (!element) return;
  element.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-card client-metric-card">
          <p class="metric-card__label">${escapeHtml(metric.label)}</p>
          <p class="metric-card__value">${escapeHtml(metric.value)}</p>
          <p class="metric-card__subtext">${escapeHtml(metric.detail || '')}</p>
        </article>
      `
    )
    .join('');
}

function renderOverview() {
  const totalLoanBalance = prospects.reduce(
    (sum, prospect) => sum + (prospect.callReport?.totals?.totalLoansAndLeases?.amount || 0),
    0
  );
  const totalIndirectBalance = prospects.reduce(
    (sum, prospect) => sum + (prospect.callReport?.indirectTotals?.amount || 0),
    0
  );
  setText(
    'research-meta',
    `Last updated ${formatDate(data.updatedAt)}. Current public NCUA cycle: ${data.latestPublicNcuaCycleDate || '-'}. Cadence target: every ${data.cadenceMinutes || 10} minutes.`
  );
  const connectionRequests = getAllConnectionRequests();
  const acceptedConnectionRequests = connectionRequests.filter(isAcceptedConnectionRequest);
  const statesCovered = new Set(prospects.map(getProspectState)).size;
  renderMetricGrid('overview-metrics', [
    { label: 'Prospects researched', value: formatNumber(prospects.length), detail: 'Seeded records in this overview' },
    { label: 'States covered', value: formatNumber(statesCovered), detail: 'Grouped from NCUA call-report profile state' },
    { label: 'Loan balance reviewed', value: formatCurrency(totalLoanBalance), detail: 'Latest call-report total loans and leases' },
    { label: 'Indirect balance reviewed', value: formatCurrency(totalIndirectBalance), detail: 'Schedule A, Section 5 balances' },
    {
      label: 'LinkedIn requests',
      value: formatNumber(connectionRequests.length),
      detail: `${formatNumber(acceptedConnectionRequests.length)} accepted; ${formatNumber(connectionRequests.length - acceptedConnectionRequests.length)} requested or pending`
    },
    { label: 'NCUA cycle', value: data.latestPublicNcuaCycleDate || '-', detail: 'Most recent public cycle observed' }
  ]);
}

function renderProspectList() {
  const list = getElement('prospect-list');
  if (!list) return;

  if (!prospects.length) {
    list.innerHTML = '<p class="empty-state">No credit union research has been captured yet.</p>';
    return;
  }

  list.innerHTML = getProspectsByState()
    .map((group) => {
      const buttons = group.items
        .map((prospect) => {
          const active = prospect.id === selectedProspectId;
          const indirect = prospect.callReport?.indirectTotals?.amount;
          const requests = getConnectionRequests(prospect);
          const acceptedCount = requests.filter(isAcceptedConnectionRequest).length;
          const badge = acceptedCount
            ? `<span class="client-connection-badge client-connection-badge--accepted">&#10003; ${formatNumber(acceptedCount)} accepted</span>`
            : requests.length
              ? `<span class="client-connection-badge client-connection-badge--pending">${formatNumber(requests.length)} requested</span>`
              : '';
          return `
            <button class="client-prospect-button" type="button" data-prospect-id="${escapeHtml(prospect.id)}" aria-pressed="${active}">
              <span>
                <strong>${escapeHtml(prospect.name)}</strong>
                <small>Charter ${escapeHtml(prospect.charterNumber)} - ${escapeHtml(prospect.priority)}</small>
              </span>
              <span class="client-prospect-button__meta">
                <span class="client-prospect-button__amount">${formatCurrency(indirect)}</span>
                ${badge}
              </span>
            </button>
          `;
        })
        .join('');
      return `
        <section class="client-state-group" aria-label="${escapeHtml(getStateLabel(group.state))}">
          <div class="client-state-group__header">
            <span>${escapeHtml(getStateLabel(group.state))}</span>
            <span class="client-state-group__summary">${formatNumber(group.items.length)} CUs / ${formatCurrency(group.indirectBalance)} indirect</span>
          </div>
          ${buttons}
        </section>
      `;
    })
    .join('');
}

function renderSelectedProspect() {
  const prospect = getSelectedProspect();
  if (!prospect) return;

  const profile = prospect.profile || {};
  const callReport = prospect.callReport || {};
  const totals = callReport.totals || {};
  const indirectTotals = callReport.indirectTotals || {};
  const derived = callReport.derivedMetrics || {};
  const mainOffice = profile.mainOffice || {};

  setText('selected-prospect-name', prospect.name);
  setText('selected-prospect-summary', prospect.summary || 'Research record is available.');
  setText('selected-prospect-status', `${prospect.status || 'Research captured'} - ${profile.type || '-'} - ${profile.status || '-'}`);
  setText(
    'selected-office-address',
    [mainOffice.street, mainOffice.city, mainOffice.state, mainOffice.zip].filter(Boolean).join(', ')
  );
  setText('selected-geocode-note', mainOffice.geocodePrecision || 'Map coordinates not available.');

  renderMetricGrid('selected-metrics', [
    { label: 'Assets', value: formatCurrency(profile.assets), detail: `${formatNumber(profile.members)} members` },
    {
      label: 'Call-report state',
      value: getStateLabel(getProspectState(prospect)),
      detail: `${callReport.creditUnionProfile?.sourceTable || 'NCUA profile'} ${callReport.creditUnionProfile?.cycleDate || callReport.cycleDate || ''}`.trim()
    },
    {
      label: 'Total loans',
      value: formatCurrency(totals.totalLoansAndLeases?.amount),
      detail: `${formatNumber(totals.totalLoansAndLeases?.count)} loans and leases`
    },
    {
      label: 'Indirect loans',
      value: formatCurrency(indirectTotals.amount),
      detail: `${formatNumber(indirectTotals.count)} loans, ${formatPercent(derived.indirectShareOfLoanBook)} of loan book`
    },
    {
      label: 'Direct auto estimate',
      value: formatCurrency(derived.directAutoLoanBalance),
      detail: `${formatNumber(derived.directAutoLoanCount)} loans after indirect vehicle adjustment`
    },
    {
      label: 'YTD loans granted',
      value: formatCurrency(totals.loansGrantedYtd?.amount),
      detail: `${formatNumber(totals.loansGrantedYtd?.count)} loans granted`
    },
    {
      label: 'Modeled VSC + GAP',
      value: formatCurrency((prospect.modeledOpportunity?.modeledMonthlyVscGfsIncome || 0) + (prospect.modeledOpportunity?.modeledMonthlyGapGfsIncome || 0)),
      detail: 'Monthly GFS income estimate from direct auto pacing'
    }
  ]);

  renderLoanTable(prospect);
  renderIndirectTable(prospect);
  renderOpportunity(prospect);
  renderRelationshipResearch(prospect);
  renderSources(prospect);
  renderQuality(prospect);
  renderMap(prospect);
}

function renderRows(tbodyId, rows, columns) {
  const tbody = getElement(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          ${columns
            .map((column) => {
              const value = column.format ? column.format(row[column.key], row) : row[column.key];
              const className = column.numeric ? ' class="numeric"' : '';
              return `<td${className}>${escapeHtml(value)}</td>`;
            })
            .join('')}
        </tr>
      `
    )
    .join('');
}

function renderLoanTable(prospect) {
  renderRows('loan-category-body', prospect.callReport?.loanCategories || [], [
    { key: 'label' },
    { key: 'accountAmountCode' },
    { key: 'interestRate', format: formatRate, numeric: true },
    { key: 'count', format: formatNumber, numeric: true },
    { key: 'amount', format: formatCurrency, numeric: true },
    { key: 'productFit' }
  ]);
}

function renderIndirectTable(prospect) {
  renderRows('indirect-loan-body', prospect.callReport?.indirectLoans || [], [
    { key: 'label' },
    { key: 'count', format: formatNumber, numeric: true },
    { key: 'amount', format: formatCurrency, numeric: true },
    { key: 'countAccountCode', format: (value, row) => `${value || '-'} / ${row.amountAccountCode || '-'}` },
    { key: 'source' }
  ]);

  const totals = prospect.callReport?.indirectTotals || {};
  setText(
    'indirect-summary',
    `Total indirect loans: ${formatNumber(totals.count)} loans / ${formatCurrency(totals.amount)}. Delinquent indirect balance: ${formatCurrency(totals.delinquentAmount)}. YTD indirect charge-offs: ${formatCurrency(totals.chargeOffsYtd)}. YTD recoveries: ${formatCurrency(totals.recoveriesYtd)}.`
  );
}

function renderOpportunity(prospect) {
  const opportunity = prospect.modeledOpportunity || {};
  renderMetricGrid('opportunity-metrics', [
    {
      label: 'Credit life model',
      value: formatCurrency(opportunity.modeledMonthlyCreditLifePremium),
      detail: 'Monthly premium model at 38% penetration'
    },
    {
      label: 'Disability model',
      value: formatCurrency(opportunity.modeledMonthlyCreditDisabilityPremium),
      detail: 'Monthly premium model at 38% penetration'
    },
    {
      label: 'Debt protection/IUI model',
      value: formatCurrency(opportunity.modeledMonthlyDebtProtectionIuiPremium),
      detail: 'Monthly premium model at 38% penetration'
    },
    {
      label: 'Direct auto originations',
      value: formatNumber(opportunity.modeledMonthlyDirectAutoOriginations),
      detail: 'Estimated monthly direct auto volume'
    }
  ]);

  const notes = getElement('opportunity-notes');
  if (notes) {
    notes.innerHTML = (opportunity.notes || []).map((note) => `<li>${escapeHtml(note)}</li>`).join('');
  }
}

function renderRelationshipResearch(prospect) {
  const research = prospect.relationshipResearch || {};
  setText('relationship-summary', `${research.resultSummary || 'No search summary captured.'} Captured ${formatDate(research.capturedAt)}.`);
  renderRows('relationship-body', research.visibleLeads || [], [
    { key: 'name' },
    { key: 'title' },
    { key: 'location' },
    { key: 'tenure' },
    { key: 'signal' },
    { key: 'connectionStatus', format: (value, row) => formatLeadConnectionStatus(row, research) }
  ]);

  const additional = getElement('additional-relationship-names');
  if (additional) {
    additional.innerHTML = (research.additionalVisibleNames || [])
      .map((name) => `<span class="client-chip">${escapeHtml(name)}</span>`)
      .join('');
  }

  renderConnectionTracking(research);
}

function renderConnectionTracking(research) {
  const requests = Array.isArray(research.connectionRequests) ? research.connectionRequests : [];
  const accepted = requests.filter(isAcceptedConnectionRequest);
  setText(
    'connection-tracking-summary',
    requests.length
      ? `${formatNumber(requests.length)} connection request${requests.length === 1 ? '' : 's'} recorded. ${formatNumber(accepted.length)} accepted from the LinkedIn connections monitor.`
      : 'No LinkedIn connection requests have been recorded for this prospect yet.'
  );

  const list = getElement('connection-request-list');
  if (!list) return;
  list.innerHTML = requests.length
    ? requests
        .map((request) => {
          const acceptedRequest = isAcceptedConnectionRequest(request);
          const statusClass = acceptedRequest ? 'accepted' : String(request.status || 'requested').toLowerCase();
          const statusLabel = formatConnectionStatus(request.status || (acceptedRequest ? 'accepted' : 'requested'));
          const dateLine = acceptedRequest
            ? `Accepted ${formatDate(request.acceptedAt)}`
            : request.requestedAt
              ? `Requested ${formatDate(request.requestedAt)}`
              : 'Request date not recorded';
          return `
            <li>
              <strong>${acceptedRequest ? '&#10003; ' : ''}${escapeHtml(request.name || 'Unnamed lead')}</strong>
              <span>${escapeHtml(request.title || request.titleMatched || 'Title not recorded')}</span>
              <span class="client-connection-status client-connection-status--${escapeHtml(statusClass)}">${escapeHtml(statusLabel)} - ${escapeHtml(dateLine)}</span>
              ${request.blocker ? `<span>${escapeHtml(request.blocker)}</span>` : ''}
            </li>
          `;
        })
        .join('')
    : '';
}

function renderSources(prospect) {
  const sourceList = getElement('source-list');
  if (!sourceList) return;
  sourceList.innerHTML = (prospect.sources || [])
    .map(
      (source) => `
        <li>
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>
          <span>${escapeHtml(source.capturedAt || '')}</span>
        </li>
      `
    )
    .join('');
}

function renderQuality(prospect) {
  const qualityList = getElement('quality-list');
  if (!qualityList) return;
  qualityList.innerHTML = (prospect.dataQuality || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderMap(prospect) {
  const mapCanvas = getElement('prospect-map');
  const location = prospect.profile?.mainOffice || {};
  if (!mapCanvas) return;

  if (!window.L || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    mapCanvas.textContent = 'Map is unavailable for this prospect.';
    return;
  }

  if (!map) {
    map = L.map(mapCanvas, { scrollWheelZoom: false }).setView([location.latitude, location.longitude], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    markerGroup = L.layerGroup().addTo(map);
  }

  markerGroup.clearLayers();
  map.setView([location.latitude, location.longitude], 10);
  L.marker([location.latitude, location.longitude])
    .addTo(markerGroup)
    .bindPopup(`<strong>${escapeHtml(prospect.name)}</strong><br>${escapeHtml(location.street || '')}<br>${escapeHtml([location.city, location.state, location.zip].filter(Boolean).join(', '))}`)
    .openPopup();
  window.setTimeout(() => map.invalidateSize(), 0);
}

getElement('prospect-list')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-prospect-id]');
  if (!button) return;
  selectedProspectId = button.dataset.prospectId;
  renderProspectList();
  renderSelectedProspect();
});

renderOverview();
renderProspectList();
renderSelectedProspect();

