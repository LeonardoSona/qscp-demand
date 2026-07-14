import { createDrawer } from './drawer.js';

const app = document.querySelector('#app');
const drawer = createDrawer();
let state = { route: 'home', playbook: null, phase: null };
let data = {};

async function loadData() {
  const files = ['playbooks', 'journeys', 'steps', 'governance', 'services', 'assets'];
  const results = await Promise.all(files.map(async name => {
    const response = await fetch(`data/${name}.json`);
    if (!response.ok) throw new Error(`Could not load ${name}.json`);
    return [name, await response.json()];
  }));
  data = Object.fromEntries(results);
}

function setState(next) {
  state = { ...state, ...next };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function homeView() {
  return `
    <section class="hero">
      <div>
        <p class="eyebrow">QSCP engagement model</p>
        <h1>How do I engage Data & AI?</h1>
        <p class="lead">Choose what you are bringing. The playbook shows the recommended business journey, decision gates and CDO services without turning the experience into a request-management tool.</p>
      </div>
      <aside class="hero-aside">
        <p class="eyebrow">How the model works</p>
        <ul class="summary-list">
          <li>Business journey explains what happens.</li>
          <li>Decision gates show where assurance is needed.</li>
          <li>CDO services show who contributes.</li>
          <li>Guidance is adapted to the type of demand.</li>
        </ul>
      </aside>
    </section>
    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">Start here</p>
        <h2>What are you bringing?</h2>
      </div>
      <div class="route-grid">
        ${data.playbooks.map(item => `
          <button class="route-card" data-playbook="${item.id}">
            <span class="route-icon">${item.icon}</span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <span class="route-link">Open playbook →</span>
          </button>`).join('')}
        <button class="route-card" data-action="assets">
          <span class="route-icon">📦</span>
          <h3>See Existing Data Products</h3>
          <p>Search reusable Data Products, dashboards, semantic models and AI capabilities before proposing a new build.</p>
          <span class="route-link">Explore assets →</span>
        </button>
      </div>
    </section>`;
}

function journeyView() {
  const journey = data.journeys[state.playbook];
  const phaseIds = journey.phases;
  const phaseCards = phaseIds.map(id => {
    const step = data.steps[id];
    return `<button class="lane-card ${state.phase === id ? 'active' : ''}" data-phase="${id}"><strong>${step.title}</strong><small>${step.purpose}</small></button>`;
  }).join('');
  const gateIds = [...new Set(phaseIds.flatMap(id => data.steps[id].gates))];
  const serviceIds = [...new Set(phaseIds.flatMap(id => data.steps[id].services))];

  return `
    <section class="journey-shell">
      <div class="journey-header">
        <div>
          <button class="back-button" data-action="home">← Back</button>
          <p class="eyebrow" style="margin-top:24px">Selected playbook</p>
          <h1>${journey.title}</h1>
          <p class="lead">${journey.subtitle}</p>
        </div>
        <button class="secondary-button" data-action="assets">Check existing assets</button>
      </div>
      <div class="lanes">
        <div class="lane">
          <div class="lane-label"><strong>Business Journey</strong><small>What happens</small></div>
          <div class="lane-content">${phaseCards}</div>
        </div>
        <div class="lane">
          <div class="lane-label"><strong>Decision Gates</strong><small>Where assurance is needed</small></div>
          <div class="lane-content">${gateIds.map(id => { const g = data.governance.find(x => x.id === id); return `<button class="lane-card gate" data-governance="${id}"><strong>${g.title}</strong><small>${g.summary}</small></button>`; }).join('')}</div>
        </div>
        <div class="lane">
          <div class="lane-label"><strong>CDO Services</strong><small>Who contributes</small></div>
          <div class="lane-content">${serviceIds.map(id => { const s = data.services.find(x => x.id === id); return `<button class="lane-card service" data-service="${id}"><strong>${s.title}</strong><small>${s.team}</small></button>`; }).join('')}</div>
        </div>
      </div>
      ${state.phase ? phaseView() : `<section class="phase-card"><p class="eyebrow">Explore the journey</p><h2>Select a phase above</h2><p class="lead">Each phase explains the information needed, expected outcomes, RACI, governance and services involved.</p></section>`}
    </section>`;
}

function phaseView() {
  const step = data.steps[state.phase];
  const journey = data.journeys[state.playbook];
  const index = journey.phases.indexOf(state.phase);
  return `
    <section class="phase-layout">
      <div>
        <article class="phase-card">
          <p class="eyebrow">Phase ${index + 1} of ${journey.phases.length}</p>
          <h1>${step.title}</h1>
          <p class="lead">${step.purpose}</p>
        </article>
        <div class="panel-grid section">
          <article class="panel">
            <p class="eyebrow">Information needed</p>
            <h3>What should be understood?</h3>
            <ul class="info-list">${step.information.map(([title, text]) => `<li><strong>${title}</strong><span>${text}</span></li>`).join('')}</ul>
          </article>
          <article class="panel">
            <p class="eyebrow">Expected outcome</p>
            <h3>What should this phase produce?</h3>
            <ul class="output-list">${step.outputs.map(x => `<li>✓ ${x}</li>`).join('')}</ul>
          </article>
          <article class="panel" style="grid-column:1/-1">
            <p class="eyebrow">RACI</p>
            <h3>Who should participate?</h3>
            <table class="raci-table"><thead><tr><th>Activity</th><th>Role</th><th>RACI</th><th>Supporting role</th><th>RACI</th></tr></thead><tbody>${step.raci.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>
          </article>
        </div>
      </div>
      <aside class="side-stack">
        <article class="side-card">
          <p class="eyebrow">Decision gates</p>
          <h3>Governance involved</h3>
          <div class="badge-list">${step.gates.map(id => { const g = data.governance.find(x => x.id === id); return `<button class="badge badge-button required" data-governance="${id}">${g.title}</button>`; }).join('')}</div>
        </article>
        <article class="side-card">
          <p class="eyebrow">CDO services</p>
          <h3>Services engaged</h3>
          <div class="badge-list">${step.services.map(id => { const s = data.services.find(x => x.id === id); return `<button class="badge badge-button" data-service="${id}">${s.title}</button>`; }).join('')}</div>
        </article>
        <article class="side-card">
          <p class="eyebrow">Ready to move on?</p>
          <h3>Check before the next phase</h3>
          <ul class="readiness-list">${step.readiness.map(x => `<li>□ ${x}</li>`).join('')}</ul>
        </article>
        <div class="phase-actions">
          <button class="secondary-button" data-phase-nav="${journey.phases[index - 1] || ''}" ${index === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="primary-button" data-phase-nav="${journey.phases[index + 1] || ''}" ${index === journey.phases.length - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      </aside>
    </section>`;
}

function assetsView() {
  const domains = [...new Set(data.assets.map(x => x.domain))].sort();
  const types = [...new Set(data.assets.map(x => x.type))].sort();
  return `
    <section class="journey-header">
      <div>
        <button class="back-button" data-action="home">← Back</button>
        <p class="eyebrow" style="margin-top:24px">Reuse before build</p>
        <h1>Existing Data Products & Assets</h1>
        <p class="lead">Search for something that can be reused or extended before creating a new solution.</p>
      </div>
    </section>
    <section class="assets-tools">
      <input id="asset-search" type="search" placeholder="Search supplier, complaints, forecasting..." />
      <select id="asset-domain"><option value="all">All domains</option>${domains.map(x => `<option>${x}</option>`).join('')}</select>
      <select id="asset-type"><option value="all">All asset types</option>${types.map(x => `<option>${x}</option>`).join('')}</select>
    </section>
    <section id="assets-grid" class="assets-grid">${renderAssets(data.assets)}</section>`;
}

function renderAssets(items) {
  if (!items.length) return `<div class="empty-state">No matching assets found.</div>`;
  return items.map(item => `<article class="asset-card"><p class="eyebrow">${item.type}</p><h3>${item.name}</h3><p>${item.owner}</p><div class="asset-meta"><span class="asset-tag">${item.domain}</span><span class="asset-tag">${item.status}</span></div></article>`).join('');
}

function openGovernance(id) {
  const item = data.governance.find(x => x.id === id);
  drawer.open(`<p class="eyebrow">Decision gate</p><h2 id="drawer-title">${item.title}</h2><p class="lead">${item.summary}</p><div class="drawer-section"><h4>When is it needed?</h4><ul>${item.when.map(x => `<li>${x}</li>`).join('')}</ul></div><div class="drawer-section"><h4>Typical outputs</h4><ul>${item.outputs.map(x => `<li>${x}</li>`).join('')}</ul></div>`);
}

function openService(id) {
  const item = data.services.find(x => x.id === id);
  drawer.open(`<p class="eyebrow">CDO service</p><h2 id="drawer-title">${item.title}</h2><p class="lead">${item.summary}</p><div class="drawer-section"><h4>Owning team</h4><p>${item.team}</p></div><div class="drawer-section"><h4>Typical deliverables</h4><ul>${item.deliverables.map(x => `<li>${x}</li>`).join('')}</ul></div>`);
}

function render() {
  app.innerHTML = state.route === 'home' ? homeView() : state.route === 'assets' ? assetsView() : journeyView();
}

function bindEvents() {
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'home') setState({ route: 'home', playbook: null, phase: null });
    if (action === 'assets') setState({ route: 'assets', phase: null });

    const playbook = event.target.closest('[data-playbook]')?.dataset.playbook;
    if (playbook) setState({ route: 'journey', playbook, phase: null });

    const phase = event.target.closest('[data-phase]')?.dataset.phase;
    if (phase) setState({ phase });

    const phaseNav = event.target.closest('[data-phase-nav]')?.dataset.phaseNav;
    if (phaseNav) setState({ phase: phaseNav });

    const governance = event.target.closest('[data-governance]')?.dataset.governance;
    if (governance) openGovernance(governance);

    const service = event.target.closest('[data-service]')?.dataset.service;
    if (service) openService(service);
  });

  document.addEventListener('input', event => {
    if (!['asset-search','asset-domain','asset-type'].includes(event.target.id)) return;
    const query = document.querySelector('#asset-search').value.toLowerCase().trim();
    const domain = document.querySelector('#asset-domain').value;
    const type = document.querySelector('#asset-type').value;
    const filtered = data.assets.filter(item => {
      const haystack = [item.name, item.domain, item.type, item.owner, ...item.keywords].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) && (domain === 'all' || item.domain === domain) && (type === 'all' || item.type === type);
    });
    document.querySelector('#assets-grid').innerHTML = renderAssets(filtered);
  });
}

async function init() {
  bindEvents();
  try {
    await loadData();
    render();
  } catch (error) {
    console.error(error);
    app.innerHTML = `<section class="phase-card"><h1>Unable to load the playbook</h1><p class="lead">This version loads configuration from JSON files. Run it through a local web server rather than opening index.html directly.</p><p><code>python -m http.server 8000</code></p></section>`;
  }
}

init();
