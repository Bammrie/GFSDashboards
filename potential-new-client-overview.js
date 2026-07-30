const statuses = ['Unreviewed','Researching','Prospect','Contacted','Meeting Set','Client','Not a Fit'];
const metricDefinitions = [
  { key: 'assets', label: 'Assets', formatter: money },
  { key: 'members', label: 'Members', formatter: count },
  { key: 'loans', label: 'Loans', formatter: money }
];
const state = { data: [], filtered: [], selected: null, meta: {} };
const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const number = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const percentage = new Intl.NumberFormat('en-US',{maximumFractionDigits:1});

function escapeHtml(value){return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function money(value){return Number.isFinite(value)?currency.format(value):'-';}
function count(value){return Number.isFinite(value)?number.format(value):'-';}
function percent(value){return Number.isFinite(value)?`${percentage.format(value)}%`:'-';}
function signedPercent(value){if(!Number.isFinite(value))return '-';const sign=value>0?'+':'';return `${sign}${percentage.format(value)}%`;}
function growthClass(value){if(!Number.isFinite(value)||Math.abs(value)<.05)return 'growth-flat';return value>0?'growth-up':'growth-down';}
function cycleLabel(cycle){const match=String(cycle||'').match(/^(\d{4})-(\d{2})$/);if(!match)return cycle||'-';const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,1));return new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(date);}
function api(path, options={}){return fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options}).then(async response=>{const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||`Request failed (${response.status})`);return body;});}

function fillSelects(){
  $('edit-status').innerHTML=statuses.map(v=>`<option>${v}</option>`).join('');
  $('status-filter').innerHTML='<option value="">All statuses</option>'+statuses.map(v=>`<option>${v}</option>`).join('');
}

function applyFilters(){
  const query=$('search-input').value.trim().toLowerCase();
  const selectedState=$('state-filter').value;
  const selectedStatus=$('status-filter').value;
  const selectedTrend=$('trend-filter').value;
  state.filtered=state.data.filter(cu=>{
    if(cu.hidden)return false;
    if(selectedState&&cu.state!==selectedState)return false;
    if(selectedStatus&&cu.salesStatus!==selectedStatus)return false;
    if(selectedTrend&&cu.trend!==selectedTrend)return false;
    if(!query)return true;
    return [cu.name,cu.charterNumber,cu.city,cu.state,cu.owner,cu.trend,...(cu.tags||[])].join(' ').toLowerCase().includes(query);
  });
  renderList();
  renderSummary();
}

function renderSummary(){
  const totalAssets=state.filtered.reduce((sum,cu)=>sum+(Number(cu.assets)||0),0);
  const states=new Set(state.filtered.map(cu=>cu.state).filter(Boolean)).size;
  const growing=state.filtered.filter(cu=>cu.trend==='Growing').length;
  const declining=state.filtered.filter(cu=>cu.trend==='Declining').length;
  $('directory-summary').innerHTML=[
    `${count(state.filtered.length)} shown`,
    `${count(states)} states / territories`,
    `${money(totalAssets)} assets`,
    `${count(growing)} growing`,
    `${count(declining)} declining`,
    `NCUA cycle ${state.meta.cycle||'not loaded'}`
  ].map(value=>`<span class="directory-chip">${escapeHtml(value)}</span>`).join('');
  $('result-count').textContent=`${count(state.filtered.length)} active credit unions match the current filters.`;
}

function renderList(){
  const list=$('credit-union-list');
  if(!state.filtered.length){list.innerHTML='<div class="empty-state"><p>No credit unions match the current filters.</p></div>';return;}
  let currentState='';
  list.innerHTML=state.filtered.map(cu=>{
    const heading=cu.state!==currentState?`<div class="state-heading">${escapeHtml(cu.state||'Unknown')}</div>`:'';
    currentState=cu.state;
    const assetGrowth=cu.growth?.assets?.fiveYearPct;
    const memberGrowth=cu.growth?.members?.fiveYearPct;
    const trend=cu.trend||'Insufficient history';
    return `${heading}<button type="button" class="cu-button" data-charter="${escapeHtml(cu.charterNumber)}" aria-pressed="${state.selected?.charterNumber===cu.charterNumber}"><span><strong>${escapeHtml(cu.name)}</strong><small>${escapeHtml([cu.city,cu.state].filter(Boolean).join(', '))}</small><small class="cu-growth"><span class="${growthClass(assetGrowth)}">Assets 5Y ${escapeHtml(signedPercent(assetGrowth))}</span><span class="${growthClass(memberGrowth)}">Members 5Y ${escapeHtml(signedPercent(memberGrowth))}</span></small><span class="status-badge">${escapeHtml(cu.salesStatus||'Unreviewed')}</span> <span class="trend-badge" data-trend="${escapeHtml(trend)}">${escapeHtml(trend)}</span></span><span class="cu-assets">${escapeHtml(money(cu.assets))}</span></button>`;
  }).join('');
  list.querySelectorAll('[data-charter]').forEach(button=>button.addEventListener('click',()=>selectCreditUnion(button.dataset.charter)));
}

function selectCreditUnion(charter){
  state.selected=state.data.find(cu=>cu.charterNumber===charter)||null;
  renderList();
  renderDetail();
}

function renderGrowthSummary(cu){
  $('growth-summary').innerHTML=metricDefinitions.map(({key,label,formatter})=>{
    const growth=cu.growth?.[key]||{};
    const projected=cu.projectedFiveYear?.[key];
    const projectionCycle=cu.projection?.at(-1)?.cycle;
    return `<article class="growth-card"><h4>${escapeHtml(label)}</h4><div class="growth-stat-grid"><div class="growth-stat"><span>1-year change</span><strong class="${growthClass(growth.oneYearPct)}">${escapeHtml(signedPercent(growth.oneYearPct))}</strong></div><div class="growth-stat"><span>5-year change</span><strong class="${growthClass(growth.fiveYearPct)}">${escapeHtml(signedPercent(growth.fiveYearPct))}</strong></div><div class="growth-stat"><span>Annual trend</span><strong class="${growthClass(growth.annualTrendPct)}">${escapeHtml(signedPercent(growth.annualTrendPct))}</strong></div><div class="growth-stat"><span>Model confidence</span><strong>${escapeHtml(growth.confidence||'Unavailable')}</strong></div><div class="growth-stat wide"><span>Projected ${escapeHtml(cycleLabel(projectionCycle))}</span><strong>${escapeHtml(formatter(projected))}</strong></div></div></article>`;
  }).join('');
}

function chartMarkup(cu, definition){
  const actual=(cu.history||[]).filter(row=>Number.isFinite(row?.[definition.key]));
  const projected=(cu.projection||[]).filter(row=>Number.isFinite(row?.[definition.key]));
  const series=[...actual,...projected];
  if(actual.length<2||!series.length){return `<article class="chart-card"><h4>${escapeHtml(definition.label)}</h4><p>Not enough history to chart.</p></article>`;}
  const width=360;
  const height=126;
  const pad=12;
  const values=series.map(row=>row[definition.key]);
  let min=Math.min(...values);
  let max=Math.max(...values);
  if(min===max){min-=1;max+=1;}
  const x=(index)=>pad+((width-(pad*2))*(index/Math.max(series.length-1,1)));
  const y=(value)=>height-pad-(((value-min)/(max-min))*(height-(pad*2)));
  const actualPath=actual.map((row,index)=>`${index?'L':'M'} ${x(index).toFixed(2)} ${y(row[definition.key]).toFixed(2)}`).join(' ');
  const bridge=[actual.at(-1),...projected];
  const projectedPath=bridge.map((row,index)=>{
    const seriesIndex=(actual.length-1)+index;
    return `${index?'L':'M'} ${x(seriesIndex).toFixed(2)} ${y(row[definition.key]).toFixed(2)}`;
  }).join(' ');
  const actualPoints=actual.map((row,index)=>`<circle class="chart-point" cx="${x(index).toFixed(2)}" cy="${y(row[definition.key]).toFixed(2)}" r="3.2"></circle>`).join('');
  const projectedPoints=projected.map((row,index)=>{const seriesIndex=actual.length+index;return `<circle class="chart-projected-point" cx="${x(seriesIndex).toFixed(2)}" cy="${y(row[definition.key]).toFixed(2)}" r="3.2"></circle>`;}).join('');
  const from=cycleLabel(actual[0]?.cycle);
  const through=cycleLabel(projected.at(-1)?.cycle||actual.at(-1)?.cycle);
  return `<article class="chart-card"><h4>${escapeHtml(definition.label)}</h4><p>${escapeHtml(from)} actual through ${escapeHtml(through)} projected</p><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(definition.label)} actual and projected trend"><line class="chart-baseline" x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}"></line><path class="chart-actual" d="${actualPath}"></path>${projected.length?`<path class="chart-projected" d="${projectedPath}"></path>`:''}${actualPoints}${projectedPoints}</svg></article>`;
}

function renderHistory(cu){
  const cycles=state.meta.historyCycles||[];
  const firstCycle=cycles[0]||cu.history?.[0]?.cycle;
  const latestCycle=cycles.at(-1)||cu.history?.at(-1)?.cycle;
  const projectionCycle=cu.projection?.at(-1)?.cycle;
  const method=state.meta.projectionMethod?.description||'Projection uses the same-quarter historical trend and is a directional estimate, not a guarantee.';
  $('history-caption').textContent=`Actual NCUA reports: ${cycleLabel(firstCycle)} through ${cycleLabel(latestCycle)}. Projection through ${cycleLabel(projectionCycle)}. ${method}`;
  renderGrowthSummary(cu);
  $('history-charts').innerHTML=metricDefinitions.map(definition=>chartMarkup(cu,definition)).join('');
  const rows=[
    ...(cu.history||[]).map(row=>({...row,type:'Actual'})),
    ...(cu.projection||[]).map(row=>({...row,type:'Projection'}))
  ];
  $('history-table').innerHTML=`<table class="history-table"><thead><tr><th>Period</th><th>Type</th><th>Assets</th><th>Members</th><th>Loans</th></tr></thead><tbody>${rows.map(row=>`<tr class="${row.type==='Projection'?'projection-row':''}"><td>${escapeHtml(cycleLabel(row.cycle))}</td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(money(row.assets))}</td><td>${escapeHtml(count(row.members))}</td><td>${escapeHtml(money(row.loans))}</td></tr>`).join('')}</tbody></table>`;
}

function renderDetail(){
  const cu=state.selected;
  $('empty-detail').hidden=Boolean(cu);
  $('credit-union-detail').hidden=!cu;
  if(!cu)return;
  $('detail-name').textContent=cu.name;
  $('detail-location').textContent=[cu.street,cu.city,cu.state,cu.zip].filter(Boolean).join(', ');
  $('detail-status').textContent=cu.salesStatus||'Unreviewed';
  $('detail-trend').textContent=cu.trend||'Insufficient history';
  $('detail-trend').dataset.trend=cu.trend||'Insufficient history';
  $('detail-metrics').innerHTML=[
    ['Assets',money(cu.assets)],
    ['Loans',money(cu.loans)],
    ['Total Auto',money(cu.totalAuto)],
    ['Indirect Auto',money(cu.indirectAuto)],
    ['Direct Auto %',percent(cu.directAutoPercent)],
    ['Mortgage (1st Lien)',money(cu.firstLienMortgage)]
  ].map(([label,value])=>`<div class="detail-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  renderHistory(cu);
  $('edit-status').value=cu.salesStatus||'Unreviewed';
  $('edit-owner').value=cu.owner||'';
  $('edit-tags').value=(cu.tags||[]).join(', ');
  $('edit-notes').value=cu.notes||'';
  $('edit-hidden').value=String(Boolean(cu.hidden));
  $('save-feedback').textContent='';
}

async function loadDirectory(){
  $('directory-meta').textContent='Loading the current NCUA directory, five-year history, and projections...';
  const payload=await api('/api/ncua-credit-unions');
  const {creditUnions,...meta}=payload;
  state.meta=meta;
  state.data=Array.isArray(creditUnions)?creditUnions:[];
  const states=[...new Set(state.data.map(cu=>cu.state).filter(Boolean))].sort();
  $('state-filter').innerHTML='<option value="">All states</option>'+states.map(value=>`<option>${escapeHtml(value)}</option>`).join('');
  const historyCycles=Array.isArray(payload.historyCycles)?payload.historyCycles:[];
  const historyLabel=historyCycles.length?` · history ${historyCycles[0]} to ${historyCycles.at(-1)} · projected ${payload.projectionYears||5} years`:'';
  $('directory-meta').textContent=payload.generatedAt?`Latest synchronized dataset: ${new Date(payload.generatedAt).toLocaleString()} · ${count(payload.count)} active credit unions${historyLabel}.`:'No synchronized dataset exists yet. Use Sync NCUA Data.';
  state.selected=state.selected?state.data.find(cu=>cu.charterNumber===state.selected.charterNumber)||null:null;
  applyFilters();
  renderDetail();
}

async function syncDirectory(){
  const button=$('sync-button');
  button.disabled=true;
  button.textContent='Syncing 5 years...';
  $('directory-meta').textContent='Downloading the current NCUA report plus the five matching prior-year reports, then rebuilding growth and projections...';
  try{await api('/api/ncua-credit-unions/sync',{method:'POST',body:'{}'});await loadDirectory();}
  catch(error){$('directory-meta').textContent=error.message;}
  finally{button.disabled=false;button.textContent='Sync NCUA Data';}
}

async function saveSelected(event){
  event.preventDefault();
  if(!state.selected)return;
  const payload={
    salesStatus:$('edit-status').value,
    owner:$('edit-owner').value,
    tags:$('edit-tags').value.split(',').map(v=>v.trim()).filter(Boolean),
    notes:$('edit-notes').value,
    hidden:$('edit-hidden').value==='true'
  };
  $('save-feedback').textContent='Saving...';
  try{
    const saved=await api(`/api/ncua-credit-unions/${encodeURIComponent(state.selected.charterNumber)}`,{method:'PATCH',body:JSON.stringify(payload)});
    Object.assign(state.selected,saved);
    $('save-feedback').textContent='Saved.';
    applyFilters();
    renderDetail();
  }catch(error){$('save-feedback').textContent=error.message;}
}

fillSelects();
['search-input','state-filter','status-filter','trend-filter'].forEach(id=>$(id).addEventListener(id==='search-input'?'input':'change',applyFilters));
$('sync-button').addEventListener('click',syncDirectory);
$('edit-form').addEventListener('submit',saveSelected);
loadDirectory().catch(error=>{$('directory-meta').textContent=error.message;});
