/* CRM dashboard — reads the shared demo store */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const fmt$ = n => '$' + Math.round(n).toLocaleString('en-US');
  const fmt2 = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const store = window.VG.store;

  /* Campaign truth: matches the numbers presented to the client */
  const CHANNELS = [
    { name: 'Local Services Ads', short: 'LSA', color: '#2E90FA', spend: 2250, leads: 12, booked: 3, revenue: 16800 },
    { name: 'Google Ads', short: 'Google', color: '#12B76A', spend: 1250, leads: 7, booked: 2, revenue: 14300 },
    { name: 'Meta Ads', short: 'Meta', color: '#7A5AF8', spend: 1000, leads: 7, booked: 1, revenue: 6300 }
  ];

  const TOT = CHANNELS.reduce((a, c) => ({
    spend: a.spend + c.spend, leads: a.leads + c.leads,
    booked: a.booked + c.booked, revenue: a.revenue + c.revenue
  }), { spend: 0, leads: 0, booked: 0, revenue: 0 });

  const STAGE_LABEL = {
    inspection: 'Inspection scheduled', contract: 'Contract signed',
    solar_detach: 'Solar detach', roof_replace: 'Roof replacement',
    solar_reset: 'Solar reset', walkthrough: 'Final walkthrough', complete: 'Complete'
  };
  const STAGE_ORDER = ['inspection', 'contract', 'solar_detach', 'roof_replace', 'solar_reset', 'walkthrough', 'complete'];
  const STAGE_SHORT = { inspection: 'Inspection', contract: 'Contract', solar_detach: 'Solar detach', roof_replace: 'Roof replace', solar_reset: 'Solar reset', walkthrough: 'Walkthrough', complete: 'Complete' };

  /* ───────── KPI ───────── */
  function sparkline(vals, color) {
    const w = 62, h = 26, max = Math.max(...vals), min = Math.min(...vals);
    const pts = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg class="kpi__spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" points="' + pts + '"/></svg>';
  }

  function renderKpis() {
    const leads = store.leads();
    const jobs = store.jobs();
    const openJobs = jobs.filter(j => j.stage !== 'complete').length;
    const quoted = leads.filter(l => l.status === 'Quoted').length;
    const cpl = TOT.spend / TOT.leads;
    const cpa = TOT.spend / TOT.booked;
    const roas = TOT.revenue / TOT.spend;

    const cards = [
      { l: 'Ad spend', v: fmt$(TOT.spend), s: 'LSA + Google + Meta', spark: [300, 420, 380, 500, 460, 540, 610], c: '#2E90FA' },
      { l: 'Revenue booked', v: fmt$(TOT.revenue), s: '<span class="up">▲ 8.3x</span> return on spend', spark: [8, 12, 10, 18, 22, 27, 37], c: '#12B76A' },
      { l: 'Leads', v: TOT.leads, s: openJobs + ' active projects', spark: [3, 5, 4, 6, 5, 7, 8], c: '#7A5AF8' },
      { l: 'Jobs booked', v: TOT.booked, s: Math.round(TOT.booked / TOT.leads * 100) + '% of leads', spark: [1, 1, 2, 2, 3, 4, 4], c: '#00A87E' },
      { l: 'Cost per lead', v: fmt$(cpl), s: 'blended across channels', spark: [210, 195, 200, 180, 176, 174, 173], c: '#F79009' },
      { l: 'Cost per acquisition', v: fmt$(cpa), s: 'per booked job', spark: [980, 940, 900, 860, 820, 780, 750], c: '#F04438' },
      { l: 'ROAS', v: roas.toFixed(1) + 'x', s: 'booked ÷ ad spend', spark: [4, 5, 6, 7, 7.5, 8, 8.3], c: '#00D6A1' },
      { l: 'Quotes out', v: quoted, s: 'awaiting decision', spark: [2, 3, 3, 4, 4, 4, 4], c: '#5925DC' }
    ];

    $('#overview').innerHTML = cards.map(c =>
      '<div class="kpi">' + sparkline(c.spark, c.c) +
      '<div class="kpi__l">' + c.l + '</div>' +
      '<div class="kpi__v">' + c.v + '</div>' +
      '<div class="kpi__s">' + c.s + '</div></div>'
    ).join('');
  }

  /* ───────── channels ───────── */
  function renderChannels() {
    const rows = CHANNELS.map(c => {
      const cpl = c.spend / c.leads, cpa = c.spend / c.booked;
      return '<tr>' +
        '<td><span class="chan"><i class="dotc" style="background:' + c.color + '"></i><span>' + c.name +
        '<span class="src">' + (c.short === 'LSA' ? 'Google Guaranteed' : c.short === 'Google' ? 'Search + PMax' : 'Reels + feed') + '</span></span></span></td>' +
        '<td>' + fmt$(c.spend) + '</td><td>' + c.leads + '</td><td>' + fmt$(cpl) + '</td>' +
        '<td>' + c.booked + '</td><td>' + fmt$(cpa) + '</td><td><b>' + fmt$(c.revenue) + '</b></td></tr>';
    }).join('');
    $('#chanTable tbody').innerHTML = rows;
    $('#chanTable tfoot').innerHTML = '<tr>' +
      '<td>Total</td><td>' + fmt$(TOT.spend) + '</td><td>' + TOT.leads + '</td>' +
      '<td>' + fmt$(TOT.spend / TOT.leads) + '</td><td>' + TOT.booked + '</td>' +
      '<td>' + fmt$(TOT.spend / TOT.booked) + '</td><td>' + fmt$(TOT.revenue) + '</td></tr>';
  }

  /* ───────── funnel ───────── */
  function renderFunnel() {
    const leads = store.leads();
    const scheduled = leads.filter(l => ['Scheduled', 'Quoted', 'Won'].includes(l.status)).length;
    const booked = leads.filter(l => l.status === 'Won').length;
    const rows = [
      ['Visitors', 1840, 100],
      ['Leads', TOT.leads, Math.round(TOT.leads / 1840 * 1000) / 10],
      ['Quotes / walkthroughs', scheduled, Math.round(scheduled / TOT.leads * 100)],
      ['Booked jobs', booked, Math.round(booked / TOT.leads * 100)]
    ];
    const max = 1840;
    $('#funnelBody').innerHTML = rows.map((r, i) => {
      const pct = Math.max(8, Math.round(r[1] / max * 100));
      return '<div class="fn"><div class="fn__l">' + r[0] + '</div>' +
        '<div class="fn__bar" style="width:' + pct + '%;background:' +
        ['linear-gradient(90deg,#0A1628,#24446B)', 'linear-gradient(90deg,#12395F,#2E90FA)', 'linear-gradient(90deg,#135C4B,#00C495)', 'linear-gradient(90deg,#046B52,#12B76A)'][i] + '">' +
        '<span>' + r[1] + '</span></div>' +
        '<div class="fn__p">' + (i === 0 ? '—' : r[2] + '%') + '</div></div>';
    }).join('');
    $('#funnelNote').innerHTML = 'Lead to booked conversion is <b>' + Math.round(booked / TOT.leads * 100) + '%</b>. Industry average for roofing sits near 15%.';
  }

  /* ───────── revenue chart ───────── */
  function renderRevenue() {
    const leads = store.leads();
    const won = leads.filter(l => l.status === 'Won');
    const W = 420, H = 150, pad = 26;
    let cum = 0;
    const pts = [];
    const days = 30;
    for (let d = days; d >= 0; d--) {
      const dayStart = new Date(); dayStart.setDate(dayStart.getDate() - d);
      const val = won.filter(l => {
        const dt = new Date(l.createdAt);
        return dt.toDateString() === dayStart.toDateString();
      }).reduce((a, x) => a + (x.value || 0), 0);
      cum += val;
      pts.push(cum);
    }
    const maxV = Math.max(...pts, TOT.revenue);
    const coords = pts.map((v, i) => {
      const x = pad + (i / (pts.length - 1)) * (W - pad * 2);
      const y = H - 24 - (v / maxV) * (H - 40);
      return [x, y];
    });
    const line = coords.map(c => c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');
    const area = line + ' ' + (W - pad) + ',' + (H - 24) + ' ' + pad + ',' + (H - 24);
    const grid = [0, 1, 2, 3].map(i => {
      const y = 20 + i * ((H - 44) / 3);
      return '<line x1="' + pad + '" y1="' + y + '" x2="' + (W - pad) + '" y2="' + y + '" stroke="#EEF3F8" stroke-width="1"/>';
    }).join('');

    $('#revChart').innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="170">' +
      grid +
      '<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#00D6A1" stop-opacity=".28"/>' +
      '<stop offset="100%" stop-color="#00D6A1" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="' + area + '" fill="url(#rg)"/>' +
      '<polyline points="' + line + '" fill="none" stroke="#00A87E" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + coords[coords.length - 1][0].toFixed(1) + '" cy="' + coords[coords.length - 1][1].toFixed(1) + '" r="4" fill="#00A87E" stroke="#fff" stroke-width="2"/>' +
      '<text x="' + pad + '" y="' + (H - 8) + '" font-size="9" fill="#8798AC">30 days ago</text>' +
      '<text x="' + (W - pad) + '" y="' + (H - 8) + '" font-size="9" fill="#8798AC" text-anchor="end">today</text>' +
      '<text x="' + pad + '" y="14" font-size="10" font-weight="800" fill="#0A1628">' + fmt$(cum) + '</text>' +
      '</svg>';
  }

  /* ───────── projects board ───────── */
  function renderBoard() {
    const jobs = store.jobs();
    const cols = ['inspection', 'contract', 'solar_detach', 'roof_replace', 'solar_reset', 'walkthrough', 'complete'];
    $('#board').innerHTML = cols.map(stage => {
      const items = jobs.filter(j => j.stage === stage);
      return '<div class="col"><div class="col__h">' + STAGE_SHORT[stage] + '<b>' + items.length + '</b></div>' +
        items.map(j => '<div class="jobcard" data-job="' + j.id + '">' +
          '<div class="jobcard__t">' + j.client + '</div>' +
          '<div class="jobcard__m"><span>' + j.id + ' · ' + j.address + '</span></div>' +
          '<div class="jobcard__m"><span class="mut">' + j.channel + '</span><span class="jobcard__v">' + fmt$(j.value) + '</span></div>' +
          '</div>').join('') + '</div>';
    }).join('');
    $('#jobsCount').textContent = jobs.filter(j => j.stage !== 'complete').length + ' active · ' +
      jobs.filter(j => j.stage === 'complete').length + ' complete';
    document.querySelectorAll('[data-job]').forEach(n => n.addEventListener('click', () => openJob(n.dataset.job)));
  }

  /* ───────── leads ───────── */
  function renderLeads() {
    const leads = store.leads();
    const order = { New: 0, Quoted: 1, Scheduled: 2, Won: 3, Lost: 4 };
    const sorted = leads.slice().sort((a, b) => {
      const s = (order[a.status] ?? 5) - (order[b.status] ?? 5);
      return s !== 0 ? s : new Date(b.createdAt) - new Date(a.createdAt);
    });
    $('#leadCount').textContent = leads.length + ' total';
    $('#leadList').innerHTML = sorted.map(l => {
      const initials = (l.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const cls = (l.status || 'New').toLowerCase();
      const age = Math.round((Date.now() - new Date(l.createdAt)) / 86400000);
      return '<div class="leadrow" data-lead="' + l.id + '">' +
        '<div class="leadrow__n"><span class="av">' + initials + '</span><span>' + (l.name || 'Unknown') +
        '<span class="src">' + (l.zip || '') + ' · ' + (age <= 0 ? 'today' : age + 'd ago') + '</span></span></div>' +
        '<div class="mut">' + (l.channel || l.source || '—') + '</div>' +
        '<div class="mut" style="font-size:12px">' + (l.need || '—') + '</div>' +
        '<div><span class="score">' + (l.score || 50) + '<span class="score__b"><i style="width:' + (l.score || 50) + '%"></i></span></span></div>' +
        '<div style="text-align:right"><span class="tag tag--' + cls + '">' + (l.status || 'New') + '</span></div>' +
        '</div>';
    }).join('');
    document.querySelectorAll('[data-lead]').forEach(n => n.addEventListener('click', () => openLead(n.dataset.lead)));
  }

  /* ───────── drawer ───────── */
  const drawer = $('#drawer'), scrim = $('#scrim');
  function closeDrawer() { drawer.classList.remove('on'); scrim.classList.remove('on'); }
  $('#drawerX').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  function openLead(id) {
    const l = store.leads().find(x => x.id === id); if (!l) return;
    $('#dTitle').textContent = l.name || 'Lead';
    $('#dSub').textContent = (l.channel || l.source || '') + ' · ' + new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · score ' + (l.score || 50);
    const status = l.status || 'New';
    const steps = [
      ['Lead captured', true, ''],
      ['Contacted', ['Quoted', 'Scheduled', 'Won'].includes(status), ''],
      ['Quote sent', ['Quoted', 'Scheduled', 'Won'].includes(status), ''],
      ['Walkthrough booked', ['Scheduled', 'Won'].includes(status), l.slot || ''],
      ['Job won', status === 'Won', l.value ? fmt$(l.value) : 'pending']
    ];
    $('#dBody').innerHTML =
      '<div class="dl">' +
      '<div class="dl__i"><div class="dl__l">Need</div><div class="dl__v">' + (l.need || '—') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Service line</div><div class="dl__v">' + (l.service || '—') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Phone</div><div class="dl__v">' + (l.phone || '—') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">ZIP</div><div class="dl__v">' + (l.zip || '—') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Solar on roof</div><div class="dl__v">' + (l.hasSolar ? 'Yes' : 'No') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Timeline</div><div class="dl__v">' + (l.timeline || '—') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Est. value</div><div class="dl__v">' + (l.value ? fmt$(l.value) : 'TBD') + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Status</div><div class="dl__v"><span class="tag tag--' + status.toLowerCase() + '">' + status + '</span></div></div>' +
      '</div>' +
      '<h4 style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6B7C93">Lead journey</h4>' +
      '<div class="timeline">' + steps.map((s, i) =>
        '<div class="tl ' + (s[1] ? 'done' : '') + '"><div class="tl__t">' + s[0] + (s[2] ? '<span>' + s[2] + '</span>' : '') + '</div>' +
        '<div class="tl__d">' + (s[1] ? 'Completed' : 'Pending') + '</div></div>').join('') + '</div>';
    $('#dCall').href = 'tel:' + (l.phone || '').replace(/[^\d+]/g, '');
    $('#dText').href = 'sms:' + (l.phone || '').replace(/[^\d+]/g, '');
    drawer.classList.add('on'); scrim.classList.add('on');
  }

  function openJob(id) {
    const j = store.jobs().find(x => x.id === id); if (!j) return;
    const idx = STAGE_ORDER.indexOf(j.stage);
    $('#dTitle').textContent = j.client + ' · ' + j.id;
    $('#dSub').textContent = j.address + ' · ' + j.channel + ' · ' + fmt$(j.value) + ' contract';
    $('#dBody').innerHTML =
      '<div class="dl">' +
      '<div class="dl__i"><div class="dl__l">Stage</div><div class="dl__v">' + STAGE_LABEL[j.stage] + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Crew lead</div><div class="dl__v">' + j.owner + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Contract value</div><div class="dl__v">' + fmt$(j.value) + '</div></div>' +
      '<div class="dl__i"><div class="dl__l">Source</div><div class="dl__v">' + j.channel + '</div></div>' +
      '</div>' +
      '<h4 style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6B7C93">Job status</h4>' +
      '<div class="timeline">' +
      STAGE_ORDER.map((s, i) => {
        const state = i < idx ? 'done' : i === idx ? 'now' : '';
        const when = i < idx ? 'Complete' : i === idx ? 'In progress' : 'Pending';
        return '<div class="tl ' + state + '"><div class="tl__t">' + STAGE_LABEL[s] +
          (i === idx ? '<span>now</span>' : '') + '</div><div class="tl__d">' + when + '</div></div>';
      }).join('') + '</div>';
    $('#dCall').href = 'tel:+16024818050';
    $('#dText').href = 'sms:+16024818050';
    drawer.classList.add('on'); scrim.classList.add('on');
  }

  /* ───────── init ───────── */
  function renderAll() {
    renderKpis(); renderChannels(); renderFunnel(); renderBoard(); renderLeads(); renderRevenue();
  }
  renderAll();

  $('#clock').textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  $('#resetBtn').addEventListener('click', () => {
    store.reset(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // live updates when a chat lead lands in the store
  window.addEventListener('vg:lead', e => {
    renderAll();
    const row = document.querySelector('[data-lead="' + e.detail.id + '"]');
    if (row) { row.classList.add('new'); row.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });

  // cross-tab sync (site open in another tab)
  window.addEventListener('storage', ev => {
    if (ev.key && ev.key.indexOf('vg_demo_leads') === 0) renderAll();
  });

  // sidebar smooth scroll
  document.querySelectorAll('.side a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelectorAll('.side a').forEach(x => x.classList.remove('on'));
      a.classList.add('on');
    });
  });
})();
