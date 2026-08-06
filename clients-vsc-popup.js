(() => {
const DIALOG_ID = 'client-production-dialog';
const RANGE_OPTIONS = Object.freeze([
{ value: '12', label: 'Last 12 months' },
{ value: '24', label: 'Last 24 months' },
{ value: 'all', label: 'All history' }
]);
const countFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const shortMonthFormatter = new Intl.DateTimeFormat('en-US', {
month: 'short',
year: '2-digit'
});
const longMonthFormatter = new Intl.DateTimeFormat('en-US', {
month: 'long',
year: 'numeric'
});
let renderScheduled = false;
function escapeHtml(value) {
return String(value ?? '')
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#39;');
}
function parseMonthLabel(label) {
const normalized = String(label || '').trim();
if (!normalized) return '';
const parsed = new Date(`1 ${normalized}`);
if (!Number.isFinite(parsed.getTime())) return '';
return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}
function dateForMonth(month) {
const match = String(month || '').match(/^(\d{4})-(\d{2})$/);
if (!match) return null;
return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}
function addMonths(month, delta) {
const date = dateForMonth(month);
if (!date) return '';
date.setMonth(date.getMonth() + delta);
return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function shortMonthLabel(month) {
const date = dateForMonth(month);
return date ? shortMonthFormatter.format(date).replace(' ', ' ’') : month;
}
function longMonthLabel(month) {
const date = dateForMonth(month);
return date ? longMonthFormatter.format(date) : month;
}
function parseCount(value) {
const cleaned = String(value ?? '').replace(/[^0-9.-]+/g, '');
if (!cleaned) return null;
const numeric = Number(cleaned);
return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}
function readVscEntries(dialog) {
const headerCells = [...dialog.querySelectorAll('#client-production-history thead th')];
const explicitVscIndex = headerCells.findIndex((cell) => /VSC/i.test(cell.textContent || ''));
const vscValueIndex = explicitVscIndex >= 0 ? explicitVscIndex : 1;
const entries = [...dialog.querySelectorAll('#client-production-history tbody tr')]
.map((row) => {
const cells = [...row.cells];
const month = parseMonthLabel(cells[0]?.textContent);
const vscPoliciesSold = parseCount(cells[vscValueIndex]?.textContent);
return month && Number.isFinite(vscPoliciesSold)
? { month, vscPoliciesSold }
: null;
})
.filter(Boolean)
.sort((a, b) => a.month.localeCompare(b.month));
const byMonth = new Map();
entries.forEach((entry) => byMonth.set(entry.month, entry));
return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}
function buildMonthlySeries(entries, rangeValue) {
if (!entries.length) return [];
const byMonth = new Map(entries.map((entry) => [entry.month, entry.vscPoliciesSold]));
const earliestMonth = entries[0].month;
const latestMonth = entries.at(-1).month;
const requestedMonths = rangeValue === 'all' ? null : Number(rangeValue);
const firstMonth = requestedMonths ? addMonths(latestMonth, -(requestedMonths - 1)) : earliestMonth;
const series = [];
for (let month = firstMonth; month && month <= latestMonth; month = addMonths(month, 1)) {
series.push({ month, vscPoliciesSold: byMonth.get(month) || 0 });
if (series.length > 240) break;
}
return series;
}
function niceMaximum(value) {
if (!Number.isFinite(value) || value <= 0) return 5;
const magnitude = 10 ** Math.floor(Math.log10(value));
const normalized = value / magnitude;
const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
return multiplier * magnitude;
}
function chartMarkup(series) {
if (!series.length) {
return '<div class="vsc-popup-empty">No VSC monthly sales have been saved for this account yet.</div>';
}
const width = 960;
const height = 320;
const margin = { top: 24, right: 18, bottom: 54, left: 56 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxValue = niceMaximum(Math.max(...series.map((entry) => entry.vscPoliciesSold)));
const x = (index) => margin.left + (plotWidth * (index / Math.max(series.length - 1, 1)));
const y = (value) => margin.top + plotHeight - ((value / maxValue) * plotHeight);
const linePath = series.map((entry, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(entry.vscPoliciesSold).toFixed(2)}`).join(' ');
const areaPath = `${linePath} L ${x(series.length - 1).toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} L ${x(0).toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} Z`;
const tickCount = 5;
const grid = Array.from({ length: tickCount }, (_, index) => {
const value = maxValue - ((maxValue * index) / (tickCount - 1));
const yValue = y(value).toFixed(2);
return `<g><line class="vsc-popup-gridline" x1="${margin.left}" y1="${yValue}" x2="${width - margin.right}" y2="${yValue}"></line><text class="vsc-popup-axis-label" x="${margin.left - 12}" y="${yValue}" text-anchor="end" dominant-baseline="middle">${escapeHtml(countFormatter.format(value))}</text></g>`;
}).join('');
const labelInterval = Math.max(1, Math.ceil(series.length / 12));
const labels = series.map((entry, index) => {
const shouldShow = index === 0 || index === series.length - 1 || index % labelInterval === 0;
return shouldShow
? `<text class="vsc-popup-axis-label" x="${x(index).toFixed(2)}" y="${height - 20}" text-anchor="middle">${escapeHtml(shortMonthLabel(entry.month))}</text>`
: '';
}).join('');
const points = series.map((entry, index) => `<circle class="vsc-popup-point" cx="${x(index).toFixed(2)}" cy="${y(entry.vscPoliciesSold).toFixed(2)}" r="4"><title>${escapeHtml(`${longMonthLabel(entry.month)}: ${countFormatter.format(entry.vscPoliciesSold)} VSC sales`)}</title></circle>`).join('');
return `<div class="vsc-popup-chart-wrap"><svg class="vsc-popup-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="VSC sales by month from ${escapeHtml(longMonthLabel(series[0].month))} through ${escapeHtml(longMonthLabel(series.at(-1).month))}"><defs><linearGradient id="vsc-popup-area-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#8a0f25" stop-opacity=".22"></stop><stop offset="100%" stop-color="#8a0f25" stop-opacity="0"></stop></linearGradient></defs>${grid}<path class="vsc-popup-area" d="${areaPath}"></path><path class="vsc-popup-line" d="${linePath}"></path>${points}${labels}</svg></div><div class="vsc-popup-legend"><span class="vsc-popup-legend__line" aria-hidden="true"></span><span>VSC Sales</span></div>`;
}
function monthTableMarkup(series) {
if (!series.length) return '';
const total = series.reduce((sum, entry) => sum + entry.vscPoliciesSold, 0);
const bestValue = Math.max(...series.map((entry) => entry.vscPoliciesSold));
const monthHeaders = series.map((entry) => `<th scope="col">${escapeHtml(shortMonthLabel(entry.month))}</th>`).join('');
const values = series.map((entry) => `<td data-best="${entry.vscPoliciesSold === bestValue && bestValue > 0}">${escapeHtml(countFormatter.format(entry.vscPoliciesSold))}</td>`).join('');
return `<div class="vsc-popup-month-table-wrap"><table class="vsc-popup-month-table"><thead><tr><th scope="col">Month</th>${monthHeaders}<th scope="col">Total</th></tr></thead><tbody><tr><th scope="row">VSC Sales</th>${values}<td>${escapeHtml(countFormatter.format(total))}</td></tr></tbody></table></div>`;
}
function accountDetails(dialog) {
const subtitle = dialog.querySelector('#client-production-dialog-subtitle')?.textContent?.trim() || '';
const delimiter = ' · Charter ';
const isRenderedSubtitle = subtitle.startsWith('VSC Monthly Production');
const delimiterIndex = subtitle.lastIndexOf(delimiter);
if (!isRenderedSubtitle && subtitle) {
const name = delimiterIndex >= 0 ? subtitle.slice(0, delimiterIndex).trim() : subtitle;
const charter = delimiterIndex >= 0 ? subtitle.slice(delimiterIndex + delimiter.length).trim() : '';
const changed = name !== dialog.dataset.vscAccountName || charter !== (dialog.dataset.vscCharter || '');
dialog.dataset.vscAccountName = name;
dialog.dataset.vscCharter = charter;
if (changed) {
dialog.dataset.vscRange = '12';
dialog.dataset.vscRenderSignature = '';
}
return { name, charter, changed };
}
return {
name: dialog.dataset.vscAccountName || 'Client Account',
charter: dialog.dataset.vscCharter || '',
changed: false
};
}
function rangeLabel(series) {
if (!series.length) return 'No saved production';
return `${longMonthLabel(series[0].month)} – ${longMonthLabel(series.at(-1).month)}`;
}
function ensurePopupStructure(dialog) {
if (dialog.classList.contains('vsc-option-one-popup')) return;
dialog.classList.add('vsc-option-one-popup');
const header = dialog.querySelector('.client-production-dialog__header');
const closeButton = dialog.querySelector('[data-close-client-production]');
if (header && closeButton && !header.querySelector('#vsc-popup-range')) {
const rangeControl = document.createElement('label');
rangeControl.className = 'vsc-popup-range-control';
rangeControl.innerHTML = `<span>Display</span><select id="vsc-popup-range" aria-label="VSC sales date range">${RANGE_OPTIONS.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}</select>`;
header.insertBefore(rangeControl, closeButton);
}
const body = dialog.querySelector('.client-production-dialog__body');
const form = dialog.querySelector('#client-production-form');
const historyHeading = dialog.querySelector('.client-production-history-heading');
if (body && form && !body.querySelector('#vsc-popup-analytics')) {
const analytics = document.createElement('section');
analytics.id = 'vsc-popup-analytics';
analytics.className = 'vsc-popup-analytics';
analytics.setAttribute('aria-label', 'VSC monthly sales summary');
body.insertBefore(analytics, form);
const details = document.createElement('details');
details.className = 'vsc-popup-entry-details';
details.innerHTML = '<summary>Update monthly production</summary>';
body.insertBefore(details, historyHeading || form.nextSibling);
details.appendChild(form);
}
}
function restoreDefaultPopup(dialog) {
if (!dialog.classList.contains('vsc-option-one-popup')) return;
const details = dialog.querySelector('.vsc-popup-entry-details');
const form = dialog.querySelector('#client-production-form');
const historyHeading = dialog.querySelector('.client-production-history-heading');
const body = dialog.querySelector('.client-production-dialog__body');
if (details && form && body) {
body.insertBefore(form, historyHeading || details);
details.remove();
}
dialog.querySelector('#vsc-popup-analytics')?.remove();
dialog.querySelector('.vsc-popup-range-control')?.remove();
dialog.classList.remove('vsc-option-one-popup');
delete dialog.dataset.vscAccountName;
delete dialog.dataset.vscCharter;
delete dialog.dataset.vscRange;
delete dialog.dataset.vscRenderSignature;
}
function renderPopup(dialog) {
const vscInput = dialog.querySelector('#client-production-form [data-production-field="vscPoliciesSold"]');
if (!vscInput) {
restoreDefaultPopup(dialog);
return;
}
ensurePopupStructure(dialog);
const { name, charter, changed } = accountDetails(dialog);
const rangeSelect = dialog.querySelector('#vsc-popup-range');
if (changed && rangeSelect) rangeSelect.value = '12';
const rangeValue = rangeSelect?.value || dialog.dataset.vscRange || '12';
dialog.dataset.vscRange = rangeValue;
if (rangeSelect && rangeSelect.value !== rangeValue) rangeSelect.value = rangeValue;
const entries = readVscEntries(dialog);
const series = buildMonthlySeries(entries, rangeValue);
const title = dialog.querySelector('#client-production-dialog-title');
const subtitle = dialog.querySelector('#client-production-dialog-subtitle');
const desiredSubtitle = `VSC Monthly Production${charter ? ` · Charter ${charter}` : ''}`;
if (title && title.textContent !== name) title.textContent = name;
if (subtitle && subtitle.textContent !== desiredSubtitle) subtitle.textContent = desiredSubtitle;
const signature = JSON.stringify({ name, charter, rangeValue, entries });
if (dialog.dataset.vscRenderSignature === signature) return;
dialog.dataset.vscRenderSignature = signature;
const analytics = dialog.querySelector('#vsc-popup-analytics');
if (!analytics) return;
const total = series.reduce((sum, entry) => sum + entry.vscPoliciesSold, 0);
const best = series.reduce((winner, entry) => (!winner || entry.vscPoliciesSold >= winner.vscPoliciesSold ? entry : winner), null);
const average = series.length ? Math.round(total / series.length) : 0;
analytics.innerHTML = `
<div class="vsc-popup-kpis">
<article class="vsc-popup-kpi"><span class="vsc-popup-kpi__icon" aria-hidden="true">▥</span><div><span class="vsc-popup-kpi__label">Total VSC Sales</span><strong class="vsc-popup-kpi__value">${escapeHtml(countFormatter.format(total))}</strong><span class="vsc-popup-kpi__note">${escapeHtml(rangeLabel(series))}</span></div></article>
<article class="vsc-popup-kpi"><span class="vsc-popup-kpi__icon" aria-hidden="true">★</span><div><span class="vsc-popup-kpi__label">Best Month</span><strong class="vsc-popup-kpi__value">${escapeHtml(countFormatter.format(best?.vscPoliciesSold || 0))}</strong><span class="vsc-popup-kpi__note">${escapeHtml(best ? longMonthLabel(best.month) : 'No saved production')}</span></div></article>
<article class="vsc-popup-kpi"><span class="vsc-popup-kpi__icon" aria-hidden="true">↗</span><div><span class="vsc-popup-kpi__label">Monthly Average</span><strong class="vsc-popup-kpi__value">${escapeHtml(countFormatter.format(average))}</strong><span class="vsc-popup-kpi__note">VSC sales per month</span></div></article>
</div>
<section class="vsc-popup-chart-section" aria-labelledby="vsc-popup-chart-title">
<header class="vsc-popup-section-header"><div><h3 id="vsc-popup-chart-title" class="vsc-popup-section-title">VSC Sales by Month</h3><p class="vsc-popup-section-caption">${escapeHtml(rangeLabel(series))}</p></div></header>
${chartMarkup(series)}
</section>
${monthTableMarkup(series)}
<footer class="vsc-popup-footer"><span>All values represent VSC contract sales saved for this account.</span><button type="button" class="vsc-popup-download" data-vsc-download>⇩ Download CSV</button></footer>`;
}
function downloadCsv(dialog) {
const entries = readVscEntries(dialog);
const rangeValue = dialog.querySelector('#vsc-popup-range')?.value || '12';
const series = buildMonthlySeries(entries, rangeValue);
if (!series.length) return;
const { name } = accountDetails(dialog);
const rows = [['Month', 'VSC Sales'], ...series.map((entry) => [longMonthLabel(entry.month), entry.vscPoliciesSold])];
const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client'}-vsc-monthly-sales.csv`;
document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(url);
}
function scheduleRender() {
if (renderScheduled) return;
renderScheduled = true;
window.requestAnimationFrame(() => {
renderScheduled = false;
const dialog = document.getElementById(DIALOG_ID);
if (dialog) renderPopup(dialog);
});
}
document.addEventListener('change', (event) => {
if (event.target.id !== 'vsc-popup-range') return;
const dialog = event.target.closest(`#${DIALOG_ID}`);
if (!dialog) return;
dialog.dataset.vscRange = event.target.value;
dialog.dataset.vscRenderSignature = '';
renderPopup(dialog);
});
document.addEventListener('click', (event) => {
const downloadButton = event.target.closest('[data-vsc-download]');
if (!downloadButton) return;
const dialog = downloadButton.closest(`#${DIALOG_ID}`);
if (dialog) downloadCsv(dialog);
});
const observer = new MutationObserver(scheduleRender);
observer.observe(document.documentElement, {
childList: true,
subtree: true,
attributes: true,
attributeFilter: ['open']
});
scheduleRender();
})();
