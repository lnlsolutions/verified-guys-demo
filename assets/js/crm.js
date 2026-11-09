/* Admin portal — tailored to The Verified Guys discovery questionnaire.
   Numbers anchored to what the owners reported: 16% lead-to-close,
   $23,000 average reroof, $817 average EV charger job. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const fmt$ = n => '$' + Math.round(n).toLocaleString('en-US');
  const store = window.VG.store;

  /* ── campaign data (30 days) ─────────────────────────────── */
  const CHANNELS = [
    { name: 'Local Services Ads', short: 'LSA', color: '#3A84F6', spend: 2000, leads: 22, est: 17, shows: 14, closed: 5, revenue: 70634 },
    { name: 'Google Ads', short: 'Google', color: '#F5B73B', spend: 1600, leads: 58, est: 34, shows: 26, closed: 9, revenue: 29536 },
    { name: 'Meta Ads', short: 'Meta', color: '#12B76A', spend: 900, leads: 30, est: 19, shows: 12, closed: 4, revenue: 20451 }
  ];
  const TOT = CHANNELS.reduce((a, c) => ({
    spend: a.spend + c.spend, leads: a.leads + c.leads, est: a.est + c.est,
    shows: a.shows + c.shows, closed: a.closed + c.closed, revenue: a.revenue + c.revenue
  }), { spend: 0, leads: 0, est: 0, shows: 0, closed: 0, revenue: 0 });

  /* ── division split ──────────────────────────────────────── */
  const DIVISIONS = [
    { name: 'Roofing', value: 92000, jobs: 4, color: '#3A84F6', avg: 23000 },
    { name: 'Electrical / EV', value: 10621, jobs: 13, color: '#F5B73B', avg: 817 },
    { name: 'Solar', value: 18000, jobs: 1, color: '#12B76A', avg: 18000 }
  ];
  const DIV_TOTAL = DIVISIONS.reduce((s, d) => s + d.value, 0);

  /* ── ZIP performance ─────────────────────────────────────── */
  const ZIPS = [
    { zip: '85254', div: 'Roof', leads: 11, est: 8, closed: 2 },
    { zip: '85258', div: 'Roof', leads: 9, est: 7, closed: 1 },
    { zip: '85253', div: 'Roof', leads: 7, est: 5, closed: 1 },
    { zip: '85260', div: 'Roof', leads: 6, est: 4, closed: 0 },
    { zip: '85048', div: 'Roof', leads: 5, est: 4, closed: 0 },
    { zip: '85298', div: 'Roof + EV', leads: 14, est: 10, closed: 2 },
    { zip: '85255', div: 'EV', leads: 16, est: 11, closed: 3 },
    { zip: '85249', div: 'EV', leads: 10, est: 7, closed: 2 },
    { zip: '85050', div: 'EV', leads: 8, est: 5, closed: 1 },
    { zip: '85142', div: 'EV', leads: 6, est: 4, closed: 1 }
  ];

  /* ── closers (owners do the follow-up today) ─────────────── */
  const CLOSERS = [
    { name: 'Micah', leads: 58, response: '3 min', rate: 0.17, revenue: 61200 },
    { name: 'Justin', leads: 52, response: '6 min', rate: 0.15, revenue: 59421 }
  ];

  /* ── reputation ──────────────────────────────────────────── */
  const REVIEWS = { month: 6, lastMonth: 4, total: 25, rating: 5.0 };

  /* ── projects ────────────────────────────────────────────── */
  const STAGE_LABEL = {
    estimate: 'Estimate scheduled', approved: 'Approved',
    inspection: 'Inspection scheduled', contract: 'Contract signed',
    solar_detach: 'Solar detach', roof_replace: 'Roof replacement',
    solar_reset: 'Solar reset', walkthrough: 'Final walkthrough',
    complete: 'Complete'
  };
  const STAGE_ORDER = ['estimate', 'approved', 'inspection', 'contract', 'solar_detach', 'roof_replace', 'solar_reset', 'walkthrough', 'complete'];
  const STAGE_SHORT = { estimate: 'Estimate', approved: 'Approved', inspection: 'Inspection', contract: 'Contract', solar_detach: 'Solar detach', roof_replace: 'Roof replace', solar_reset: 'Solar reset', walkthrough: 'Walkthrough', complete: 'Complete' };

  /* ───────── KPI ───────── */
  function kpi(label, value, sub, tone) {
    return '<div class="kpi"><div class="kpi__l">' + label + '</div>' +
      '<div class="kpi__v">' + value + '</div>' +
      '<div class="kpi__d' + (tone ? ' ' + tone : '') + '">' + sub + '</div></div>';
  }

  function renderKpis() {
    const leads = store.leads();
    const contacted = 104;
    const needsFollowUp = leads.filter(l => l.status === 'New' || l.status === 'Needs follow-up').length + 4;
    const showRate = Math.round(TOT.shows / TOT.est * 100);
    $('#kpis').innerHTML = [
      kpi('Leads contacted', contacted + '<span class="kpi__of">/' + TOT.leads + '</span>', '94% of new leads worked'),
      kpi('Needs follow-up', needsFollowUp, 'Oldest waiting 6h', needsFollowUp > 5 ? 'warn' : ''),
      kpi('Estimates closed', TOT.closed, Math.round(TOT.closed / TOT.leads * 100) + '% lead to close'),
      kpi('Revenue booked', fmt$(TOT.revenue), 'Roof + EV + solar'),
      kpi('Ad spend', fmt$(TOT.spend), '30 days, all channels'),
      kpi('Cost per estimate', fmt$(TOT.spend / TOT.est), TOT.est + ' estimates run'),
      kpi('Show rate', showRate + '%', TOT.shows + ' of ' + TOT.est + ' showed'),
      kpi('Speed to lead', CLOSERS[0].response, 'Median first response')
    ].join('');
  }

  /* ───────── follow-up queue ───────── */
  function renderFollowUp() {
    const leads = store.leads()
      .filter(l => l.status === 'New' || l.status === 'Needs follow-up')
      .slice(0, 5);
    if (!leads.length) {
      $('#followupList').innerHTML = '<div class="empty">Nothing waiting. Every lead has been contacted.</div>';
      return;
    }
    $('#followupList').innerHTML = leads.map(l => {
      const wait = l.status === 'Needs follow-up' ? '6h' : '<1h';
      return '<div class="frow" data-lead="' + l.id + '">' +
        '<div class="av">' + (l.name || '?').slice(0, 1).toUpperCase() + '</div>' +
        '<div class="frow__n"><b>' + (l.name || 'Unknown') + '</b>' +
        '<span>' + (l.need || 'General') + (l.zip ? ' · ' + l.zip : '') + '</span></div>' +
        '<div class="frow__t"><span class="pill ' + (wait === '6h' ? 'pill--warn' : 'pill--ok') + '">' + wait + '</span></div></div>';
    }).join('');
    document.querySelectorAll('[data-lead]').forEach(n => n.addEventListener('click', () => openLead(n.dataset.lead)));
  }

  /* ───────── divisions ───────── */
  function renderSplit() {
    $('#split').innerHTML = DIVISIONS.map(d => {
      const pct = Math.round(d.value / DIV_TOTAL * 100);
      return '<div class="spl"><div class="spl__t">' + d.name + '</div>' +
        '<div class="spl__v">' + fmt$(d.value) + '</div>' +
        '<div class="spl__m">' + d.jobs + ' jobs · avg ' + fmt$(d.avg) + '</div>' +
        '<div class="spl__bar"><i style="width:' + pct + '%;background:' + d.color + '"></i></div></div>';
    }).join('');
  }

  /* ───────── channels ───────── */
  function renderChannels() {
    const tb = $('#chanTable tbody');
    tb.innerHTML = CHANNELS.map(c => {
      return '<tr><td><span class="chan"><i style="background:' + c.color + '"></i>' + c.name + '</span></td>' +
        '<td>' + fmt$(c.spend) + '</td><td>' + c.leads + '</td><td>' + c.est + '</td>' +
        '<td>' + c.shows + '</td><td>' + c.closed + '</td>' +
        '<td>' + fmt$(c.spend / c.est) + '</td><td>' + fmt$(c.revenue) + '</td></tr>';
    }).join('') +
      '<tr class="tot"><td>Total</td><td>' + fmt$(TOT.spend) + '</td><td>' + TOT.leads + '</td><td>' + TOT.est + '</td>' +
      '<td>' + TOT.shows + '</td><td>' + TOT.closed + '</td><td>' + fmt$(TOT.spend / TOT.est) + '</td><td>' + fmt$(TOT.revenue) + '</td></tr>';
  }

  /* ───────── ZIP heat ───────── */
  function renderZips() {
    const max = Math.max(...ZIPS.map(z => z.leads));
    $('#zipgrid').innerHTML = ZIPS.map(z => {
      const t = z.leads / max;
      const col = t > 0.75 ? '#1857C5' : t > 0.5 ? '#3A84F6' : t > 0.3 ? '#6BA2F9' : '#0D2D6E';
      return '<div class="zt" style="background:' + col + '"><em>' + z.div + '</em>' +
        '<b>' + z.zip + '</b><span>' + z.leads + ' leads · ' + z.est + ' est · ' + z.closed + ' closed</span></div>';
    }).join('');
  }

  /* ───────── closers ───────── */
  function renderClosers() {
    $('#closerRows').innerHTML = CLOSERS.map(c => {
      const rate = Math.round(c.rate * 100);
      const tone = c.rate >= 0.16 ? 'pill--ok' : 'pill--warn';
      return '<div class="closer"><div class="closer__n"><span class="av">' + c.name[0] + '</span>' + c.name + '</div>' +
        '<div>' + c.leads + '</div><div>' + c.response + '</div>' +
        '<div><span class="pill ' + tone + '">' + rate + '%</span></div>' +
        '<div>' + fmt$(c.revenue) + '</div></div>';
    }).join('');
  }

  /* ───────── reviews ───────── */
  function renderReviews() {
    const pct = Math.round((REVIEWS.month / 8) * 100);
    $('#reviewBox').innerHTML =
      '<div class="spl__v">+' + REVIEWS.month + ' <span style="font-size:13px;font-weight:600;color:#5A6B8C">new reviews</span></div>' +
      '<div class="spl__m" style="margin-bottom:10px">' + REVIEWS.lastMonth + ' last month · ' + REVIEWS.total + ' total · ' + REVIEWS.rating.toFixed(1) + ' average</div>' +
      '<div class="spl__bar"><i style="width:' + pct + '%;background:#F5B73B"></i></div>' +
      '<div class="spl__m" style="margin-top:10px">Target is one review per completed job. Every job gets the ask at the final walkthrough.</div>';
  }

  /* ───────── funnel ───────── */
  function renderFunnel() {
    const rows = [
      ['New leads', TOT.leads, 100],
      ['Contacted', 104, 95],
      ['Estimate set', TOT.est, 64],
      ['Estimate ran', TOT.shows, 47],
      ['Closed', TOT.closed, 16]
    ];
    $('#funnel').innerHTML = rows.map(([label, val, pct]) =>
      '<div class="fn"><div class="fn__l">' + label + '</div>' +
      '<div class="fn__b"><i style="width:' + pct + '%"></i></div>' +
      '<div class="fn__v">' + val + '</div></div>').join('');
  }

  /* ───────── projects board ───────── */
  function renderBoard() {
    const jobs = store.jobs();
    const board = $('#board');
    board.innerHTML = STAGE_ORDER.map(stage => {
      const items = jobs.filter(j => j.stage === stage);
      if (!items.length && !['estimate', 'contract', 'roof_replace', 'complete'].includes(stage)) return '';
      return '<div class="col"><div class="col__h">' + STAGE_SHORT[stage] +
        '<span>' + items.length + '</span></div>' +
        items.map(j => '<div class="jobcard" data-job="' + j.id + '">' +
          '<div class="jobcard__n">' + (j.customer || j.client || 'Job') + '</div>' +
          '<div class="jobcard__m">' + (j.city || j.address || '') + ' ' + (j.zip || '') + '</div>' +
          '<div class="jobcard__v">' + fmt$(j.value || 0) + '</div>' +
          '<div class="jobcard__c"><i style="background:' + (j.color || '#3A84F6') + '"></i>' + (j.channel || 'Direct') + '</div>' +
          '</div>').join('') + '</div>';
    }).join('');
    document.querySelectorAll('[data-job]').forEach(n => n.addEventListener('click', () => openJob(n.dataset.job)));
  }

  /* ───────── leads ───────── */
  function renderLeads() {
    const leads = store.leads().slice(0, 14);
    $('#leadList').innerHTML = leads.map(l => {
      const initials = (l.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const sc = l.score || 0;
      const tone = sc >= 80 ? 'pill--ok' : sc >= 60 ? 'pill--warn' : 'pill--bad';
      return '<div class="leadrow" data-lead="' + l.id + '">' +
        '<div class="leadrow__n"><span class="av">' + initials + '</span><span>' + (l.name || 'Unknown') +
        '<em>' + (l.channel || 'Website') + '</em></span></div>' +
        '<div>' + (l.need || '—') + '</div>' +
        '<div>' + (l.zip || '—') + '</div>' +
        '<div><span class="pill ' + tone + '">' + sc + '</span></div>' +
        '<div>' + (l.status || 'New') + '</div></div>';
    }).join('');
    document.querySelectorAll('[data-lead]').forEach(n => n.addEventListener('click', () => openLead(n.dataset.lead)));
  }

  /* ───────── drawer ───────── */
  const drawer = $('#drawer'), scrim = $('#scrim');
  function closeDrawer() { drawer.classList.remove('on'); scrim.classList.remove('on'); }
  $('#drawer').addEventListener('click', e => { if (e.target.id === 'drawerX') closeDrawer(); });
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  function openLead(id) {
    const l = store.leads().find(x => x.id === id);
    if (!l) return;
    drawer.innerHTML = '<div class="drawer__h"><div><b>' + (l.name || 'Lead') + '</b>' +
      '<span>' + (l.need || 'General') + '</span></div><button id="drawerX" class="drawer__x">×</button></div>' +
      '<div class="drawer__b">' +
      row('Phone', l.phone || '—') + row('Email', l.email || '—') +
      row('Property', l.address || '—') + row('ZIP', l.zip || '—') +
      row('Timeline', l.timeline || '—') + row('Channel', l.channel || '—') +
      row('Score', (l.score || 0) + ' / 97') + row('Status', l.status || 'New') +
      (l.slot ? row('Estimate', l.slot) : '') +
      '</div>';
    drawer.classList.add('on'); scrim.classList.add('on');
  }

  function openJob(id) {
    const j = store.jobs().find(x => x.id === id);
    if (!j) return;
    const idx = STAGE_ORDER.indexOf(j.stage);
    const timeline = STAGE_ORDER.slice(0, Math.max(idx + 1, 1)).map((s, i) =>
      '<li class="' + (i === idx ? 'now' : 'done') + '"><span></span>' + STAGE_LABEL[s] + '</li>').join('');
    drawer.innerHTML = '<div class="drawer__h"><div><b>' + (j.customer || j.client || 'Job') + '</b>' +
      '<span>' + (j.city || j.address || '') + ' ' + (j.zip || '') + ' · ' + (j.channel || 'Direct') + '</span></div>' +
      '<button id="drawerX" class="drawer__x">×</button></div>' +
      '<div class="drawer__b">' +
      row('Contract value', fmt$(j.value || 0)) +
      row('Stage', STAGE_LABEL[j.stage] || j.stage) +
      row('Crew lead', j.crew || j.owner || '—') +
      '<div class="drawer__sec">Status timeline</div><ul class="tl">' + timeline + '</ul>' +
      '</div>';
    drawer.classList.add('on'); scrim.classList.add('on');
  }

  function row(k, v) {
    return '<div class="drow"><span>' + k + '</span><b>' + v + '</b></div>';
  }

  /* ───────── boot ───────── */
  function renderAll() {
    renderKpis(); renderFollowUp(); renderSplit(); renderChannels();
    renderZips(); renderClosers(); renderReviews(); renderFunnel();
    renderBoard(); renderLeads();
  }
  renderAll();

  window.addEventListener('vg:lead', renderAll);
  window.addEventListener('storage', e => { if (e.key && e.key.indexOf('vg_demo_leads') === 0) renderAll(); });
  const reset = $('#resetBtn');
  if (reset) reset.addEventListener('click', () => { store.reset(); renderAll(); });
})();
