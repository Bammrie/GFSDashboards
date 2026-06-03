const COMMISSION_ACCOUNTS = [
  {
    id: 'common-cents-credit-union',
    name: 'CommonCents Credit Union',
    shortName: 'CommonCents',
    color: '#7a1e2c',
    colorSoft: '#f1d7dc',
    entries: [
      ['Nov 2023', 15153.18], ['Dec 2023', 15017.16], ['Jan 2024', 15099.22], ['Feb 2024', 14615.65],
      ['Mar 2024', 14522.99], ['Apr 2024', 14114.35], ['May 2024', 13727.57], ['Jun 2024', 13576.38],
      ['Jul 2024', 13584.99], ['Aug 2024', 13370.38], ['Sep 2024', 13045.76], ['Oct 2024', 12617.49],
      ['Nov 2024', 12377.45], ['Dec 2024', 12228.41], ['Jan 2025', 11775.82], ['Feb 2025', 11346.22],
      ['Mar 2025', 10891.01], ['Apr 2025', 10706.32], ['May 2025', 10459.3], ['Jun 2025', 10361.97],
      ['Jul 2025', 10313.15], ['Aug 2025', 10023.23], ['Sep 2025', 10020.06], ['Oct 2025', 9686.34],
      ['Nov 2025', 9464.97], ['Dec 2025', 9125.61], ['Jan 2026', 8842.97], ['Feb 2026', 8477.89],
      ['Mar 2026', 8207.69], ['Apr 2026', 8000.82], ['May 2026', 7779.75]
    ]
  },
  {
    id: 'coastal-community',
    name: 'Coastal Community',
    shortName: 'Coastal',
    color: '#087f8c',
    colorSoft: '#d4f3f6',
    entries: [
      ['Nov 2023', 17049.29], ['Dec 2023', 17087.96], ['Jan 2024', 17147.91], ['Feb 2024', 17011.77],
      ['Mar 2024', 16999.48], ['Apr 2024', 16851.59], ['May 2024', 16957.94], ['Jun 2024', 17049.29],
      ['Jul 2024', 16748.99], ['Aug 2024', 17350.42], ['Sep 2024', 17863.32], ['Oct 2024', 18115.75],
      ['Nov 2024', 18292.92], ['Dec 2024', 17941.82], ['Jan 2025', 17547.16], ['Feb 2025', 17164.7],
      ['Mar 2025', 17225.25], ['Apr 2025', 17080.75], ['May 2025', 16764.94], ['Jun 2025', 16481.05],
      ['Jul 2025', 16129.41], ['Aug 2025', 15782.79], ['Sep 2025', 15384.24], ['Oct 2025', 15105.63],
      ['Nov 2025', 15010.64], ['Dec 2025', 14767.94], ['Jan 2026', 14308.86], ['Feb 2026', 14032.75],
      ['Mar 2026', 13761.13], ['Apr 2026', 13563.97]
    ]
  },
  {
    id: 'mct-credit-union-adjusted',
    name: 'MCT Credit Union Adjusted',
    shortName: 'MCT',
    color: '#b7791f',
    colorSoft: '#f8ecd6',
    entries: [
      ['Nov 2023', 37857.73], ['Dec 2023', 38515.04], ['Jan 2024', 38492.71], ['Feb 2024', 38996.4],
      ['Mar 2024', 38795.38], ['Apr 2024', 39505.33], ['May 2024', 40033.53], ['Jun 2024', 39692.89],
      ['Jul 2024', 39315.15], ['Aug 2024', 39631.7], ['Sep 2024', 39546.17], ['Oct 2024', 39202.62],
      ['Nov 2024', 38454.29], ['Dec 2024', 37950.19], ['Jan 2025', 37753.69], ['Feb 2025', 37539.64],
      ['Mar 2025', 36510.73], ['Apr 2025', 36392.4], ['May 2025', 35710.64], ['Jun 2025', 35470.58],
      ['Jul 2025', 35248.64], ['Aug 2025', 35174.82], ['Sep 2025', 35513.86], ['Oct 2025', 35370.68],
      ['Nov 2025', 35484.68], ['Dec 2025', 35605.09], ['Jan 2026', 35615.86], ['Feb 2026', 36336.67],
      ['Mar 2026', 36255.41], ['Apr 2026', 36458.52], ['May 2026', 37219.45]
    ]
  },
  {
    id: 'nspire',
    name: 'Nspire',
    shortName: 'Nspire',
    color: '#5b4b8a',
    colorSoft: '#e7e1f7',
    entries: [
      ['Nov 2023', 1716.47], ['Dec 2023', 1873.53], ['Jan 2024', 1811.27], ['Feb 2024', 1788.19],
      ['Mar 2024', 1680.67], ['Apr 2024', 2277.72], ['May 2024', 2229.48], ['Jun 2024', 2168.79],
      ['Jul 2024', 2115.11], ['Aug 2024', 2032.96], ['Sep 2024', 2021.85], ['Oct 2024', 2021.54],
      ['Nov 2024', 2328.28], ['Dec 2024', 2383.32], ['Jan 2025', 2323.22], ['Feb 2025', 3057.1],
      ['Mar 2025', 2947.53], ['Apr 2025', 2907.72], ['May 2025', 2854.04], ['Jun 2025', 2867.2],
      ['Jul 2025', 3278.57], ['Aug 2025', 3698.16], ['Sep 2025', 1587.02], ['Oct 2025', 1601.64],
      ['Nov 2025', 1599.05], ['Dec 2025', -16589.89], ['Jan 2026', 1483.77], ['Feb 2026', 1421.98],
      ['Mar 2026', 1482.27], ['Apr 2026', 1373.79], ['May 2026', 1338.66]
    ]
  },
  {
    id: 'old-ocean',
    name: 'Old Ocean',
    shortName: 'Old Ocean',
    color: '#2563eb',
    colorSoft: '#dbeafe',
    entries: [
      ['Nov 2023', 2006.31], ['Dec 2023', 1983.88], ['Jan 2024', 1921.84], ['Feb 2024', 1869.4],
      ['Mar 2024', 1767.85], ['Apr 2024', 1649.02], ['May 2024', 1568.78], ['Jun 2024', 1588.43],
      ['Jul 2024', 1546.01], ['Aug 2024', 1543.31], ['Sep 2024', 1498.22], ['Oct 2024', 1444.44],
      ['Nov 2024', 1394.7], ['Dec 2024', 1336.72], ['Jan 2025', 1292.62], ['Feb 2025', 1257.41],
      ['Mar 2025', 1211.51], ['Apr 2025', 1183.88], ['May 2025', 1182.54], ['Jun 2025', 1135.52],
      ['Jul 2025', 1100.8], ['Aug 2025', 1194.34], ['Sep 2025', 1167.15], ['Oct 2025', 1208.75],
      ['Nov 2025', 1127.92], ['Dec 2025', 1135.4], ['Jan 2026', 1098.96], ['Feb 2026', 998.23],
      ['Mar 2026', 967.53], ['Apr 2026', 895.67], ['May 2026', 932.64]
    ]
  }
];

const monthIndex = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const moneyNoCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const el = {
  accountFilter: document.getElementById('commission-account-filter'),
  yearFilter: document.getElementById('commission-year-filter'),
  total: document.getElementById('commission-total'),
  totalNote: document.getElementById('commission-total-note'),
  latest: document.getElementById('commission-latest'),
  latestNote: document.getElementById('commission-latest-note'),
  average: document.getElementById('commission-average'),
  averageNote: document.getElementById('commission-average-note'),
  yearTotal: document.getElementById('commission-year-total'),
  yearNote: document.getElementById('commission-year-note'),
  momentum: document.getElementById('commission-momentum'),
  momentumNote: document.getElementById('commission-momentum-note'),
  leader: document.getElementById('commission-leader'),
  leaderNote: document.getElementById('commission-leader-note'),
  trendNote: document.getElementById('commission-trend-note'),
  trendChart: document.getElementById('commission-trend-chart'),
  accountChart: document.getElementById('commission-account-chart'),
  shareChart: document.getElementById('commission-share-chart'),
  cards: document.getElementById('commission-account-cards'),
  yearHead: document.getElementById('commission-year-head'),
  yearBody: document.getElementById('commission-year-body'),
  momentumBody: document.getElementById('commission-momentum-body'),
  monthHead: document.getElementById('commission-month-head'),
  monthBody: document.getElementById('commission-month-body'),
  monthNote: document.getElementById('commission-month-note'),
  highlights: document.getElementById('commission-highlights')
};

function parseMonth(label) {
  const [monthName, yearText] = label.split(' ');
  const month = monthIndex[monthName];
  const year = Number.parseInt(yearText, 10);
  const key = `${year}-${String(month).padStart(2, '0')}`;
  return {
    year,
    month,
    key,
    periodKey: year * 100 + month,
    shortLabel: label,
    label: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  };
}

function accountEntries(account) {
  return {
    ...account,
    entries: account.entries
      .map(([businessMonth, totalAmount]) => ({ ...parseMonth(businessMonth), accountId: account.id, amount: totalAmount }))
      .sort((a, b) => a.periodKey - b.periodKey)
  };
}

function signedMoney(value) {
  if (!Number.isFinite(value) || value === 0) return money.format(0);
  return `${value > 0 ? '+' : '-'}${money.format(Math.abs(value))}`;
}

function signedPercent(value) {
  if (!Number.isFinite(value) || value === 0) return '0.0%';
  return `${value > 0 ? '+' : '-'}${decimal.format(Math.abs(value))}%`;
}

function avg(values) {
  const filtered = values.filter(Number.isFinite);
  return filtered.length ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : null;
}

function summarize(account, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const first = entries[0] || null;
  const latest = entries[entries.length - 1] || null;
  const best = entries.reduce((winner, entry) => (!winner || entry.amount > winner.amount ? entry : winner), null);
  const lowest = entries.reduce((winner, entry) => (!winner || entry.amount < winner.amount ? entry : winner), null);
  const lastThree = avg(entries.slice(-3).map((entry) => entry.amount));
  const priorThree = avg(entries.slice(-6, -3).map((entry) => entry.amount));
  const rollingChange = Number.isFinite(lastThree) && Number.isFinite(priorThree) ? lastThree - priorThree : null;
  const totalChange = latest && first ? latest.amount - first.amount : null;
  return {
    ...account,
    entries,
    total,
    average: entries.length ? total / entries.length : 0,
    first,
    latest,
    best,
    lowest,
    rollingChange,
    rollingPercent: Number.isFinite(rollingChange) && priorThree ? (rollingChange / priorThree) * 100 : null,
    totalChange,
    totalChangePercent: Number.isFinite(totalChange) && first?.amount ? (totalChange / first.amount) * 100 : null
  };
}

function buildModel() {
  const accountId = el.accountFilter?.value || 'all';
  const yearFilter = el.yearFilter?.value || 'all';
  const accounts = COMMISSION_ACCOUNTS.map(accountEntries)
    .filter((account) => accountId === 'all' || account.id === accountId)
    .map((account) => ({
      ...account,
      entries: yearFilter === 'all' ? account.entries : account.entries.filter((entry) => entry.year === Number(yearFilter))
    }))
    .map((account) => summarize(account, account.entries));
  const entries = accounts.flatMap((account) => account.entries);
  const monthKeys = Array.from(new Set(entries.map((entry) => entry.key))).sort();
  const months = monthKeys.map((key) => {
    const rowEntries = entries.filter((entry) => entry.key === key);
    const sample = rowEntries[0];
    const byAccount = Object.fromEntries(accounts.map((account) => {
      const match = account.entries.find((entry) => entry.key === key);
      return [account.id, match ? match.amount : null];
    }));
    return {
      key,
      year: sample.year,
      label: sample.label,
      shortLabel: sample.shortLabel,
      total: rowEntries.reduce((sum, entry) => sum + entry.amount, 0),
      byAccount,
      coverageCount: rowEntries.length,
      expectedCount: accounts.length
    };
  });
  months.forEach((month, index) => {
    const previous = months[index - 1];
    month.monthOverMonth = previous ? month.total - previous.total : null;
    month.monthOverMonthPercent = previous?.total ? (month.monthOverMonth / previous.total) * 100 : null;
  });
  const selectedIds = new Set(accounts.map((account) => account.id));
  const years = Array.from(new Set(entries.map((entry) => entry.year))).sort((a, b) => a - b);
  const yearRows = years.map((year) => {
    const byAccount = Object.fromEntries(COMMISSION_ACCOUNTS.map((account) => [
      account.id,
      selectedIds.has(account.id)
        ? entries.filter((entry) => entry.accountId === account.id && entry.year === year).reduce((sum, entry) => sum + entry.amount, 0)
        : null
    ]));
    return { year, byAccount, combined: Object.values(byAccount).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0) };
  });
  yearRows.forEach((row, index) => {
    const previous = yearRows[index - 1];
    row.yoy = previous ? row.combined - previous.combined : null;
    row.yoyPercent = previous?.combined ? (row.yoy / previous.combined) * 100 : null;
  });
  const comparable = months.filter((month) => month.expectedCount && month.coverageCount === month.expectedCount);
  const firstComparable = comparable[0] || null;
  const latestComparable = comparable[comparable.length - 1] || null;
  const total = months.reduce((sum, month) => sum + month.total, 0);
  const latestYear = months.length ? Math.max(...months.map((month) => month.year)) : null;
  const focusYear = yearFilter === 'all' ? latestYear : Number(yearFilter);
  const leader = accounts.filter((account) => account.total > 0).sort((a, b) => b.total - a.total)[0] || null;
  const comparableChange = firstComparable && latestComparable ? latestComparable.total - firstComparable.total : null;
  return {
    accountId,
    yearFilter,
    accounts,
    entries,
    months,
    yearRows,
    total,
    latestYear,
    focusYear,
    focusYearTotal: Number.isFinite(focusYear) ? months.filter((month) => month.year === focusYear).reduce((sum, month) => sum + month.total, 0) : total,
    averageMonth: months.length ? total / months.length : 0,
    latestMonth: months[months.length - 1] || null,
    firstComparable,
    latestComparable,
    comparableChange,
    comparablePercent: Number.isFinite(comparableChange) && firstComparable?.total ? (comparableChange / firstComparable.total) * 100 : null,
    leader
  };
}

function text(node, value) {
  if (node) node.textContent = value;
}

function renderKpis(model) {
  text(el.total, money.format(model.total));
  text(el.totalNote, `${integer.format(model.entries.length)} account-months reported`);
  text(el.latest, model.latestMonth ? money.format(model.latestMonth.total) : money.format(0));
  text(el.latestNote, model.latestMonth ? `${model.latestMonth.shortLabel}; ${model.latestMonth.coverageCount} of ${model.latestMonth.expectedCount} accounts reported` : 'No reported months');
  text(el.average, money.format(model.averageMonth));
  text(el.averageNote, `${integer.format(model.months.length)} business months`);
  text(el.yearTotal, money.format(model.focusYearTotal));
  text(el.yearNote, `${model.focusYear || 'Selected'}${model.yearFilter === 'all' ? ' YTD' : ''} selected total`);
  text(el.momentum, Number.isFinite(model.comparableChange) ? signedMoney(model.comparableChange) : money.format(0));
  text(el.momentumNote, model.firstComparable && model.latestComparable ? `${model.firstComparable.shortLabel} to ${model.latestComparable.shortLabel} (${signedPercent(model.comparablePercent)})` : 'Need comparable months');
  text(el.leader, model.leader?.shortName || 'Waiting');
  text(el.leaderNote, model.leader ? `${money.format(model.leader.total)} (${decimal.format((model.leader.total / model.total) * 100)}% share)` : 'No account total');
}

function renderTrend(model) {
  if (!el.trendChart) return;
  el.trendChart.replaceChildren();
  if (!model.months.length) return;
  const width = 980;
  const height = 360;
  const pad = { top: 28, right: 30, bottom: 92, left: 78 };
  const values = model.months.flatMap((month) => [month.total, ...model.accounts.map((account) => month.byAccount[account.id]).filter(Number.isFinite)]);
  const min = Math.min(...values);
  const max = Math.max(...values, 1);
  const chartMin = Math.min(0, min * 1.05);
  const chartMax = max * 1.05;
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (model.months.length === 1 ? plotWidth / 2 : (plotWidth * index) / (model.months.length - 1));
  const y = (value) => pad.top + plotHeight - ((value - chartMin) / (chartMax - chartMin)) * plotHeight;
  const bars = model.months.map((month, index) => `<rect x="${x(index) - 8}" y="${y(Math.max(month.total, 0))}" width="16" height="${Math.abs(y(month.total) - y(0)) || 1}" fill="rgba(122,30,44,0.16)" />`).join('');
  const accountLines = model.accounts.map((account) => {
    const points = model.months.map((month, index) => Number.isFinite(month.byAccount[account.id]) ? `${x(index)},${y(month.byAccount[account.id])}` : null).filter(Boolean).join(' ');
    return points ? `<polyline points="${points}" fill="none" stroke="${account.color}" stroke-width="2.5" opacity="0.78" />` : '';
  }).join('');
  const combined = model.months.map((month, index) => `${x(index)},${y(month.total)}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(model.months.length / 7));
  const labels = model.months.map((month, index) => index % labelEvery === 0 || index === model.months.length - 1 ? `<text x="${x(index)}" y="${height - 52}" text-anchor="middle">${month.shortLabel}</text>` : '').join('');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((position) => {
    const value = chartMin + (chartMax - chartMin) * position;
    return `<g><line x1="${pad.left}" x2="${width - pad.right}" y1="${y(value)}" y2="${y(value)}" stroke="rgba(17,17,17,0.08)" /><text x="${pad.left - 12}" y="${y(value) + 4}" text-anchor="end">${moneyNoCents.format(value)}</text></g>`;
  }).join('');
  const legend = model.accounts.map((account, index) => `<g transform="translate(${pad.left + index * 155}, ${height - 28})"><rect width="12" height="12" fill="${account.color}" /><text x="18" y="11">${account.shortName}</text></g>`).join('');
  const latest = model.months[model.months.length - 1];
  el.trendChart.innerHTML = `<svg class="commission-line-chart__svg line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly commission trend">${ticks}${bars}${accountLines}<polyline points="${combined}" fill="none" stroke="#151515" stroke-width="4" /><circle cx="${x(model.months.length - 1)}" cy="${y(latest.total)}" r="6" fill="#151515" />${labels}${legend}</svg>`;
  text(el.trendNote, `${model.months[0].shortLabel} through ${latest.shortLabel}; combined line uses reported account totals.`);
}

function renderBars(model) {
  if (!el.accountChart) return;
  el.accountChart.replaceChildren();
  const max = Math.max(...model.accounts.map((account) => account.total), 1);
  model.accounts.slice().sort((a, b) => b.total - a.total).forEach((account) => {
    const row = document.createElement('div');
    row.className = 'commission-bar-row';
    row.innerHTML = `<div class="commission-bar-row__label"><strong>${account.shortName}</strong><span>${account.entries.length} months</span></div><div class="commission-bar-row__track"><span style="width:${Math.max(3, (account.total / max) * 100)}%;background-color:${account.color}"></span></div><p class="commission-bar-row__value">${money.format(account.total)}</p>`;
    el.accountChart.append(row);
  });
}

function renderShare(model) {
  if (!el.shareChart) return;
  el.shareChart.replaceChildren();
  const stack = document.createElement('div');
  stack.className = 'commission-share-stack';
  model.accounts.forEach((account) => {
    const segment = document.createElement('span');
    segment.style.width = `${model.total ? (account.total / model.total) * 100 : 0}%`;
    segment.style.backgroundColor = account.color;
    stack.append(segment);
  });
  const list = document.createElement('div');
  list.className = 'commission-share-list';
  model.accounts.slice().sort((a, b) => b.total - a.total).forEach((account) => {
    const share = model.total ? (account.total / model.total) * 100 : 0;
    const row = document.createElement('div');
    row.className = 'commission-share-item';
    row.innerHTML = `<span style="background-color:${account.color}"></span><strong>${account.shortName}</strong><em>${decimal.format(share)}%</em><b>${money.format(account.total)}</b>`;
    list.append(row);
  });
  el.shareChart.append(stack, list);
}

function renderCards(model) {
  if (!el.cards) return;
  el.cards.replaceChildren();
  model.accounts.forEach((account) => {
    const card = document.createElement('article');
    card.className = 'commission-account-card';
    card.style.setProperty('--account-color', account.color);
    card.style.setProperty('--account-color-soft', account.colorSoft);
    card.innerHTML = `<header><p>${account.name}</p><strong>${money.format(account.total)}</strong></header><dl>
      <div><dt>Average month</dt><dd>${money.format(account.average)}</dd></div>
      <div><dt>Latest</dt><dd>${account.latest ? `${money.format(account.latest.amount)} in ${account.latest.shortLabel}` : 'No data'}</dd></div>
      <div><dt>Best month</dt><dd>${account.best ? `${money.format(account.best.amount)} in ${account.best.shortLabel}` : 'No data'}</dd></div>
      <div><dt>Low month</dt><dd>${account.lowest ? `${money.format(account.lowest.amount)} in ${account.lowest.shortLabel}` : 'No data'}</dd></div>
      <div><dt>Start to latest</dt><dd>${Number.isFinite(account.totalChange) ? `${signedMoney(account.totalChange)} (${signedPercent(account.totalChangePercent)})` : 'Not enough data'}</dd></div>
    </dl>`;
    el.cards.append(card);
  });
}

function headerCell(label, numeric = false) {
  const th = document.createElement('th');
  th.scope = 'col';
  th.textContent = label;
  if (numeric) th.className = 'numeric';
  return th;
}

function renderTables(model) {
  if (el.yearHead) el.yearHead.replaceChildren(headerCell('Year'), ...COMMISSION_ACCOUNTS.map((account) => headerCell(account.shortName, true)), headerCell('Combined', true), headerCell('YoY', true));
  if (el.monthHead) el.monthHead.replaceChildren(headerCell('Business month'), ...COMMISSION_ACCOUNTS.map((account) => headerCell(account.shortName, true)), headerCell('Combined', true), headerCell('MoM', true), headerCell('Coverage'));
  if (el.yearBody) {
    el.yearBody.replaceChildren();
    model.yearRows.forEach((year) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${year.year}</td>${COMMISSION_ACCOUNTS.map((account) => `<td class="numeric">${Number.isFinite(year.byAccount[account.id]) ? money.format(year.byAccount[account.id]) : '-'}</td>`).join('')}<td class="numeric">${money.format(year.combined)}</td><td class="numeric" data-tone="${year.yoy >= 0 ? 'positive' : 'negative'}">${Number.isFinite(year.yoy) ? `${signedMoney(year.yoy)} (${signedPercent(year.yoyPercent)})` : '-'}</td>`;
      el.yearBody.append(row);
    });
  }
  if (el.momentumBody) {
    el.momentumBody.replaceChildren();
    model.accounts.forEach((account) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${account.shortName}</td><td class="numeric">${account.latest ? `${money.format(account.latest.amount)} (${account.latest.shortLabel})` : '-'}</td><td class="numeric">${account.best ? `${money.format(account.best.amount)} (${account.best.shortLabel})` : '-'}</td><td class="numeric" data-tone="${account.rollingChange >= 0 ? 'positive' : 'negative'}">${Number.isFinite(account.rollingChange) ? `${signedMoney(account.rollingChange)} (${signedPercent(account.rollingPercent)})` : 'Need 6 months'}</td>`;
      el.momentumBody.append(row);
    });
  }
  if (el.monthBody) {
    el.monthBody.replaceChildren();
    model.months.forEach((month) => {
      const row = document.createElement('tr');
      if (month.coverageCount < month.expectedCount) row.dataset.state = 'partial';
      row.innerHTML = `<td class="period-cell">${month.label}</td>${COMMISSION_ACCOUNTS.map((account) => `<td class="numeric">${Number.isFinite(month.byAccount[account.id]) ? money.format(month.byAccount[account.id]) : '-'}</td>`).join('')}<td class="numeric">${money.format(month.total)}</td><td class="numeric" data-tone="${month.monthOverMonth >= 0 ? 'positive' : 'negative'}">${Number.isFinite(month.monthOverMonth) ? `${signedMoney(month.monthOverMonth)} (${signedPercent(month.monthOverMonthPercent)})` : '-'}</td><td>${month.coverageCount} of ${month.expectedCount} accounts</td>`;
      el.monthBody.append(row);
    });
    const partial = model.months.filter((month) => month.coverageCount < month.expectedCount).length;
    text(el.monthNote, partial ? `${model.months.length} months shown; ${partial} month has partial account coverage.` : `${model.months.length} fully comparable months shown.`);
  }
}

function renderHighlights(model) {
  if (!el.highlights) return;
  const best = model.months.reduce((winner, month) => (!winner || month.total > winner.total ? month : winner), null);
  const low = model.months.reduce((winner, month) => (!winner || month.total < winner.total ? month : winner), null);
  const notes = [];
  if (model.leader) notes.push(`${model.leader.name} leads the selected view with ${money.format(model.leader.total)}, or ${decimal.format((model.leader.total / model.total) * 100)}% of production.`);
  if (best) notes.push(`${best.label} is the strongest combined month at ${money.format(best.total)}.`);
  if (low) notes.push(`${low.label} is the lowest selected combined month at ${money.format(low.total)}.`);
  if (model.firstComparable && model.latestComparable) notes.push(`Comparable production moved ${signedMoney(model.comparableChange)} from ${model.firstComparable.shortLabel} to ${model.latestComparable.shortLabel}.`);
  el.highlights.innerHTML = `<ul>${notes.map((note) => `<li>${note}</li>`).join('')}</ul>`;
}

function render() {
  const model = buildModel();
  renderKpis(model);
  renderTrend(model);
  renderBars(model);
  renderShare(model);
  renderCards(model);
  renderTables(model);
  renderHighlights(model);
}

function init() {
  if (!document.getElementById('commission-dashboard')) return;
  const current = el.accountFilter?.value || 'all';
  if (el.accountFilter) {
    el.accountFilter.replaceChildren(new Option('All accounts', 'all'), ...COMMISSION_ACCOUNTS.map((account) => new Option(account.name, account.id)));
    el.accountFilter.value = COMMISSION_ACCOUNTS.some((account) => account.id === current) ? current : 'all';
    el.accountFilter.addEventListener('change', render);
  }
  el.yearFilter?.addEventListener('change', render);
  render();
}

init();
