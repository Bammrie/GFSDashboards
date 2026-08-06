const directAutoCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
const directAutoPercent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

function directAutoNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function directAutoEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function directAutoBalance(client) {
  const explicit = directAutoNumber(client.directAuto);
  if (Number.isFinite(explicit)) return Math.max(0, explicit);

  const totalAuto = directAutoNumber(client.totalAuto);
  const indirectAuto = directAutoNumber(client.indirectAuto);
  if (Number.isFinite(totalAuto) && Number.isFinite(indirectAuto)) {
    return Math.max(0, totalAuto - indirectAuto);
  }

  const directPercent = directAutoNumber(client.directAutoPercent ?? client.directAutoPercentage);
  if (Number.isFinite(totalAuto) && Number.isFinite(directPercent)) {
    return Math.max(0, totalAuto * (directPercent / 100));
  }

  return null;
}

function installDirectAutoSection() {
  if (document.getElementById('direct-auto-ranking')) return;

  const dialogBody = document.getElementById('direct-auto-dialog-body');
  const clientList = document.querySelector('[aria-labelledby="client-list-title"]');
  if (!dialogBody && !clientList) return;

  const style = document.createElement('style');
  style.textContent = `
    .direct-auto-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;flex-wrap:wrap}
    .direct-auto-header .panel__header{margin:0}
    .direct-auto-summary{margin:0;color:var(--text-secondary);font-weight:750}
    .direct-auto-ranking{display:grid;gap:.65rem;margin-top:1rem}
    .direct-auto-row{display:grid;grid-template-columns:52px minmax(220px,1.35fr) minmax(220px,2fr) minmax(130px,.7fr);gap:1rem;align-items:center;border:1px solid var(--border);background:linear-gradient(90deg,#fff,#faf6f7);padding:.8rem .9rem}
    .direct-auto-rank{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--accent);color:#fff;font-weight:900;font-variant-numeric:tabular-nums}
    .direct-auto-name{display:block;color:var(--accent);font-weight:850}
    .direct-auto-location{display:block;margin-top:.15rem;color:var(--text-secondary);font-size:.76rem}
    .direct-auto-bar-track{height:12px;background:#eadfe2;overflow:hidden}
    .direct-auto-bar{height:100%;min-width:3px;background:var(--accent)}
    .direct-auto-bar-meta{display:flex;justify-content:space-between;gap:.75rem;margin-top:.3rem;color:var(--text-secondary);font-size:.74rem;font-weight:700}
    .direct-auto-value{text-align:right;font-size:1.05rem;font-weight:900;color:var(--text-primary);font-variant-numeric:tabular-nums}
    .direct-auto-empty{margin-top:1rem;padding:1rem;border:1px dashed #aaa;background:#fafafa;color:#333}
    @media(max-width:760px){.direct-auto-row{grid-template-columns:44px 1fr}.direct-auto-chart,.direct-auto-value{grid-column:2}.direct-auto-value{text-align:left}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'direct-auto-ranking';
  section.className = 'panel';
  section.setAttribute('aria-labelledby', 'direct-auto-ranking-title');
  section.innerHTML = `
    <div class="direct-auto-header">
      <header class="panel__header">
        <h2 id="direct-auto-ranking-title" class="panel__title">Top Direct Auto Lenders</h2>
        <p class="panel__description">Current clients ranked by estimated direct auto loan balance. Direct auto equals total auto loans less indirect auto loans when no explicit direct balance is reported.</p>
      </header>
      <p id="direct-auto-summary" class="direct-auto-summary">Loading rankings…</p>
    </div>
    <div id="direct-auto-ranking-list" class="direct-auto-ranking"></div>
    <div id="direct-auto-ranking-empty" class="direct-auto-empty" hidden>No direct auto balances are available for current clients.</div>
  `;
  if (dialogBody) dialogBody.appendChild(section);
  else clientList.parentNode.insertBefore(section, clientList);
}

async function loadDirectAutoRanking() {
  installDirectAutoSection();
  const list = document.getElementById('direct-auto-ranking-list');
  const empty = document.getElementById('direct-auto-ranking-empty');
  const summary = document.getElementById('direct-auto-summary');
  if (!list || !empty || !summary) return;

  try {
    const response = await fetch('/api/ncua-credit-unions', { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);

    const ranked = (Array.isArray(payload.creditUnions) ? payload.creditUnions : [])
      .filter((client) => client.salesStatus === 'Client' && !client.hidden)
      .map((client) => ({ ...client, directAutoBalance: directAutoBalance(client) }))
      .filter((client) => Number.isFinite(client.directAutoBalance))
      .sort((a, b) => b.directAutoBalance - a.directAutoBalance || String(a.name).localeCompare(String(b.name)))
      .slice(0, 10);

    if (!ranked.length) {
      list.innerHTML = '';
      empty.hidden = false;
      summary.textContent = 'No ranked clients';
      return;
    }

    empty.hidden = true;
    const maximum = ranked[0].directAutoBalance || 1;
    const total = ranked.reduce((sum, client) => sum + client.directAutoBalance, 0);
    summary.textContent = `${ranked.length} lenders · ${directAutoCurrency.format(total)} combined direct auto`;
    list.innerHTML = ranked.map((client, index) => {
      const totalAuto = directAutoNumber(client.totalAuto);
      const share = Number.isFinite(totalAuto) && totalAuto > 0
        ? (client.directAutoBalance / totalAuto) * 100
        : null;
      const width = Math.max(2, (client.directAutoBalance / maximum) * 100);
      const location = [client.city, client.state].filter(Boolean).join(', ') || `Charter ${client.charterNumber || '—'}`;
      return `<article class="direct-auto-row">
        <span class="direct-auto-rank">${index + 1}</span>
        <div><strong class="direct-auto-name">${directAutoEscape(client.name)}</strong><span class="direct-auto-location">${directAutoEscape(location)}</span></div>
        <div class="direct-auto-chart"><div class="direct-auto-bar-track"><div class="direct-auto-bar" style="width:${width.toFixed(2)}%"></div></div><div class="direct-auto-bar-meta"><span>${Number.isFinite(share) ? `${directAutoPercent.format(share)}% of auto portfolio` : 'Auto share unavailable'}</span><span>${directAutoEscape(client.charterNumber ? `Charter ${client.charterNumber}` : '')}</span></div></div>
        <strong class="direct-auto-value">${directAutoCurrency.format(client.directAutoBalance)}</strong>
      </article>`;
    }).join('');
  } catch (error) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = `Unable to load direct auto rankings: ${error.message}`;
    summary.textContent = 'Ranking unavailable';
  }
}

installDirectAutoSection();
loadDirectAutoRanking();
document.getElementById('refresh-clients')?.addEventListener('click', () => window.setTimeout(loadDirectAutoRanking, 125));
