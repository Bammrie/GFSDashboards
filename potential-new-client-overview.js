const statuses = ['Unreviewed','Researching','Prospect','Contacted','Meeting Set','Client','Not a Fit'];
const state = { data: [], filtered: [], selected: null, meta: {} };
const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const number = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const percentage = new Intl.NumberFormat('en-US',{maximumFractionDigits:1});

function escapeHtml(value){return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function money(value){return Number.isFinite(value)?currency.format(value):'-';}
function count(value){return Number.isFinite(value)?number.format(value):'-';}
function percent(value){return Number.isFinite(value)?`${percentage.format(value)}%`:'-';}
function api(path, options={}){return fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options}).then(async response=>{const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||`Request failed (${response.status})`);return body;});}

function fillSelects(){
  $('edit-status').innerHTML=statuses.map(v=>`<option>${v}</option>`).join('');
  $('status-filter').innerHTML='<option value="">All statuses</option>'+statuses.map(v=>`<option>${v}</option>`).join('');
}

function applyFilters(){
  const query=$('search-input').value.trim().toLowerCase();
  const selectedState=$('state-filter').value;
  const selectedStatus=$('status-filter').value;
  state.filtered=state.data.filter(cu=>{
    if(cu.hidden)return false;
    if(selectedState&&cu.state!==selectedState)return false;
    if(selectedStatus&&cu.salesStatus!==selectedStatus)return false;
    if(!query)return true;
    return [cu.name,cu.charterNumber,cu.city,cu.state,cu.owner,...(cu.tags||[])].join(' ').toLowerCase().includes(query);
  });
  renderList();
  renderSummary();
}

function renderSummary(){
  const totalAssets=state.filtered.reduce((sum,cu)=>sum+(Number(cu.assets)||0),0);
  const states=new Set(state.filtered.map(cu=>cu.state).filter(Boolean)).size;
  $('directory-summary').innerHTML=[
    `${count(state.filtered.length)} shown`,
    `${count(states)} states / territories`,
    `${money(totalAssets)} assets`,
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
    return `${heading}<button type="button" class="cu-button" data-charter="${escapeHtml(cu.charterNumber)}" aria-pressed="${state.selected?.charterNumber===cu.charterNumber}"><span><strong>${escapeHtml(cu.name)}</strong><small>${escapeHtml([cu.city,cu.state].filter(Boolean).join(', '))}</small><span class="status-badge">${escapeHtml(cu.salesStatus||'Unreviewed')}</span></span><span class="cu-assets">${escapeHtml(money(cu.assets))}</span></button>`;
  }).join('');
  list.querySelectorAll('[data-charter]').forEach(button=>button.addEventListener('click',()=>selectCreditUnion(button.dataset.charter)));
}

function selectCreditUnion(charter){
  state.selected=state.data.find(cu=>cu.charterNumber===charter)||null;
  renderList();
  renderDetail();
}

function renderDetail(){
  const cu=state.selected;
  $('empty-detail').hidden=Boolean(cu);
  $('credit-union-detail').hidden=!cu;
  if(!cu)return;
  $('detail-name').textContent=cu.name;
  $('detail-location').textContent=[cu.street,cu.city,cu.state,cu.zip].filter(Boolean).join(', ');
  $('detail-status').textContent=cu.salesStatus||'Unreviewed';
  $('detail-metrics').innerHTML=[
    ['Assets',money(cu.assets)],
    ['Loans',money(cu.loans)],
    ['Total Auto',money(cu.totalAuto)],
    ['Indirect Auto',money(cu.indirectAuto)],
    ['Direct Auto %',percent(cu.directAutoPercent)],
    ['Mortgage (1st Lien)',money(cu.firstLienMortgage)]
  ].map(([label,value])=>`<div class="detail-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  $('edit-status').value=cu.salesStatus||'Unreviewed';
  $('edit-owner').value=cu.owner||'';
  $('edit-tags').value=(cu.tags||[]).join(', ');
  $('edit-notes').value=cu.notes||'';
  $('edit-hidden').value=String(Boolean(cu.hidden));
  $('save-feedback').textContent='';
}

async function loadDirectory(){
  $('directory-meta').textContent='Loading NCUA directory...';
  const payload=await api('/api/ncua-credit-unions');
  state.meta=payload;
  state.data=Array.isArray(payload.creditUnions)?payload.creditUnions:[];
  const states=[...new Set(state.data.map(cu=>cu.state).filter(Boolean))].sort();
  $('state-filter').innerHTML='<option value="">All states</option>'+states.map(value=>`<option>${escapeHtml(value)}</option>`).join('');
  $('directory-meta').textContent=payload.generatedAt?`Latest synchronized dataset: ${new Date(payload.generatedAt).toLocaleString()} · ${count(payload.count)} active credit unions.`:'No synchronized dataset exists yet. Use Sync NCUA Data.';
  state.selected=state.selected?state.data.find(cu=>cu.charterNumber===state.selected.charterNumber)||null:null;
  applyFilters();
  renderDetail();
}

async function syncDirectory(){
  const button=$('sync-button');
  button.disabled=true;
  button.textContent='Syncing...';
  $('directory-meta').textContent='Downloading and processing the latest configured NCUA active list and call-report lending data...';
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
['search-input','state-filter','status-filter'].forEach(id=>$(id).addEventListener(id==='search-input'?'input':'change',applyFilters));
$('sync-button').addEventListener('click',syncDirectory);
$('edit-form').addEventListener('submit',saveSelected);
loadDirectory().catch(error=>{$('directory-meta').textContent=error.message;});
