/* The Verified Guys — demo app
   Shared store (localStorage) powers both the site chat and the CRM dashboard. */
(function () {
  'use strict';

  const LS = {
    leads: 'vg_demo_leads_v1',
    jobs: 'vg_demo_jobs_v1',
    seeded: 'vg_demo_seeded_v1'
  };

  const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? fb : v; } catch (e) { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const uid = p => p + '_' + Math.random().toString(36).slice(2, 8);
  const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
  const daysAhead = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); };

  /* ── seed once ───────────────────────────────────────────── */
  function seed() {
    const existingLeads = read(LS.leads, []);
    const existingJobs = read(LS.jobs, []);
    const leads = [
      { name: 'Olga A.', phone: '(602) 555-0142', zip: '85032', need: 'Roof + Solar Detach/Reset', service: 'Roofing', hasSolar: true, timeline: 'ASAP', source: 'LSA', channel: 'LSA', status: 'Won', value: 14800, createdAt: daysAgo(21) },
      { name: 'Julie A.', phone: '(480) 555-0198', zip: '85254', need: 'Roof Repair', service: 'Roofing', hasSolar: false, timeline: 'ASAP', source: 'Google Ads', channel: 'Google Ads', status: 'Won', value: 3200, createdAt: daysAgo(19) },
      { name: 'Len T.', phone: '(602) 555-0110', zip: '85050', need: 'Roof + Solar Detach/Reset', service: 'Roofing', hasSolar: true, timeline: '1-3 months', source: 'LSA', channel: 'LSA', status: 'Won', value: 16200, createdAt: daysAgo(17) },
      { name: 'Andrew M.', phone: '(602) 555-0177', zip: '85085', need: 'Solar & Battery', service: 'Solar', hasSolar: false, timeline: 'ASAP', source: 'Meta', channel: 'Meta', status: 'Won', value: 11400, createdAt: daysAgo(15) },
      { name: 'Marc D.', phone: '(480) 555-0164', zip: '85260', need: 'Electrical', service: 'Electrical', hasSolar: false, timeline: 'ASAP', source: 'Google Ads', channel: 'Google Ads', status: 'Won', value: 2100, createdAt: daysAgo(12) },
      { name: 'Brian M.', phone: '(602) 555-0133', zip: '85032', need: 'Roof + Solar Detach/Reset', service: 'Roofing', hasSolar: true, timeline: 'ASAP', source: 'LSA', channel: 'LSA', status: 'Won', value: 13900, createdAt: daysAgo(9) },
      { name: 'Nick D.', phone: '(602) 555-0121', zip: '85050', need: 'Electrical', service: 'Electrical', hasSolar: false, timeline: '1-3 months', source: 'Meta', channel: 'Meta', status: 'Quoted', value: 1850, createdAt: daysAgo(8) },
      { name: 'Aniwat P.', phone: '(480) 555-0155', zip: '85251', need: 'Electrical', service: 'Electrical', hasSolar: false, timeline: 'ASAP', source: 'Google Ads', channel: 'Google Ads', status: 'Quoted', value: 2400, createdAt: daysAgo(7) },
      { name: 'Becky A.', phone: '(602) 555-0188', zip: '85086', need: 'Roof Replacement', service: 'Roofing', hasSolar: false, timeline: 'ASAP', source: 'LSA', channel: 'LSA', status: 'Quoted', value: 12400, createdAt: daysAgo(6) },
      { name: 'Colten G.', phone: '(480) 555-0199', zip: '85260', need: 'Roof + Solar Detach/Reset', service: 'Roofing', hasSolar: true, timeline: '1-3 months', source: 'LSA', channel: 'LSA', status: 'Scheduled', value: 15100, createdAt: daysAgo(5) },
      { name: 'Fred G.', phone: '(602) 555-0147', zip: '85032', need: 'Roof Repair', service: 'Roofing', hasSolar: false, timeline: 'ASAP', source: 'Meta', channel: 'Meta', status: 'Quoted', value: 2900, createdAt: daysAgo(4) },
      { name: 'Michelle F.', phone: '(480) 555-0176', zip: '85254', need: 'Roof Replacement', service: 'Roofing', hasSolar: false, timeline: '1-3 months', source: 'Google Ads', channel: 'Google Ads', status: 'Scheduled', value: 11700, createdAt: daysAgo(3) },
      { name: 'Doug B.', phone: '(602) 555-0112', zip: '85085', need: 'Storm Damage', service: 'Roofing', hasSolar: true, timeline: 'ASAP', source: 'LSA', channel: 'LSA', status: 'New', value: 0, createdAt: daysAgo(2) },
      { name: 'Dylan C.', phone: '(480) 555-0168', zip: '85248', need: 'Solar & Battery', service: 'Solar', hasSolar: false, timeline: 'Just pricing', source: 'Meta', channel: 'Meta', status: 'New', value: 0, createdAt: daysAgo(1) },
      { name: 'Edwin S.', phone: '(602) 555-0139', zip: '85032', need: 'Roof + Solar Detach/Reset', service: 'Roofing', hasSolar: true, timeline: 'ASAP', source: 'LSA', channel: 'LSA', status: 'New', value: 0, createdAt: daysAgo(0) }
    ].map(l => Object.assign({ id: uid('L'), score: scoreOf(l) }, l));

    const jobs = [
      { id: 'J-1041', customer: 'Olga A.', address: 'Phoenix', zip: '85032', value: 24100, channel: 'LSA', color: '#3A84F6', stage: 'walkthrough', crew: 'Micah', start: daysAgo(18) },
      { id: 'J-1042', customer: 'Len T.', address: 'Paradise Valley', zip: '85253', value: 26800, channel: 'LSA', color: '#3A84F6', stage: 'solar_reset', crew: 'Justin', start: daysAgo(14) },
      { id: 'J-1043', customer: 'Andrew M.', address: 'Scottsdale', zip: '85255', value: 817, channel: 'Meta', color: '#F5B73B', stage: 'approved', crew: 'Micah', start: daysAgo(11) },
      { id: 'J-1044', customer: 'Brian M.', address: 'Phoenix', zip: '85032', value: 23400, channel: 'LSA', color: '#3A84F6', stage: 'solar_detach', crew: 'Justin', start: daysAgo(6) },
      { id: 'J-1045', customer: 'Colten G.', address: 'Scottsdale', zip: '85260', value: 25200, channel: 'LSA', color: '#3A84F6', stage: 'contract', crew: 'Micah', start: daysAgo(4) },
      { id: 'J-1046', customer: 'Michelle F.', address: 'Scottsdale', zip: '85254', value: 22900, channel: 'Google Ads', color: '#F5B73B', stage: 'inspection', crew: 'Justin', start: daysAgo(2) },
      { id: 'J-1047', customer: 'Julie A.', address: 'Scottsdale', zip: '85254', value: 817, channel: 'Google Ads', color: '#F5B73B', stage: 'complete', crew: 'Micah', start: daysAgo(19) },
      { id: 'J-1048', customer: 'Marc D.', address: 'Scottsdale', zip: '85260', value: 817, channel: 'Google Ads', color: '#F5B73B', stage: 'complete', crew: 'Justin', start: daysAgo(12) },
      { id: 'J-1049', customer: 'Dylan C.', address: 'Scottsdale', zip: '85255', value: 817, channel: 'Meta', color: '#F5B73B', stage: 'estimate', crew: 'Micah', start: daysAgo(1) },
      { id: 'J-1050', customer: 'Doug B.', address: 'Fountain Hills', zip: '85268', value: 24600, channel: 'LSA', color: '#3A84F6', stage: 'estimate', crew: 'Justin', start: daysAgo(1) }
    ];
    const haveLeads = new Set(existingLeads.map(l => (l.name || '').toLowerCase()));
    const haveJobs = new Set(existingJobs.map(j => j.id));
    write(LS.leads, existingLeads.concat(leads.filter(l => !haveLeads.has((l.name || '').toLowerCase()))));
    write(LS.jobs, existingJobs.concat(jobs.filter(j => !haveJobs.has(j.id))));
    write(LS.seeded, true);
  }

  function scoreOf(l) {
    let s = 40;
    if (/ASAP/i.test(l.timeline || '')) s += 25;
    if (/1-3/i.test(l.timeline || '')) s += 12;
    if (l.hasSolar) s += 10;
    if (/Detach|Replacement|Battery/i.test(l.need || '')) s += 10;
    return Math.min(97, s);
  }

  seed();

  const store = {
    leads: () => read(LS.leads, []),
    jobs: () => read(LS.jobs, []),
    addLead(l) {
      const leads = this.leads();
      const lead = Object.assign({
        id: uid('L'), createdAt: new Date().toISOString(), status: 'New',
        source: 'Website', channel: 'Website — AI Chat', value: 0
      }, l);
      lead.score = scoreOf(lead);
      leads.unshift(lead);
      write(LS.leads, leads);
      window.dispatchEvent(new CustomEvent('vg:lead', { detail: lead }));
      return lead;
    },
    reset() { localStorage.removeItem(LS.leads); localStorage.removeItem(LS.jobs); localStorage.removeItem(LS.seeded); seed(); }
  };

  /* ── tiny helpers ────────────────────────────────────────── */
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  let toastT;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    $('#toastText').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 3600);
  }

  /* ── nav / faq / reveal ──────────────────────────────────── */
  const burger = $('#burger'), navlinks = $('#navlinks');
  if (burger) burger.addEventListener('click', () => navlinks.classList.toggle('open'));
  document.querySelectorAll('#navlinks a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

  document.querySelectorAll('.q button').forEach(b => {
    b.addEventListener('click', () => {
      const q = b.parentElement;
      const open = q.classList.contains('open');
      document.querySelectorAll('.q').forEach(x => x.classList.remove('open'));
      if (!open) q.classList.add('open');
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(n => io.observe(n));
  } else {
    document.querySelectorAll('.reveal').forEach(n => n.classList.add('in'));
  }

  /* ── quote form ──────────────────────────────────────────── */
  let need = 'Roof + Solar Detach/Reset';
  document.querySelectorAll('#needChips .chip-opt').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#needChips .chip-opt').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      need = chip.dataset.need;
    });
  });

  const qf = $('#quoteForm');
  if (qf) qf.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#qName').value.trim(), phone = $('#qPhone').value.trim(), zip = $('#qZip').value.trim();
    if (!name || !phone || !zip) { toast('Add your name, phone, and ZIP so we can reach you.'); return; }
    const lead = store.addLead({
      name, phone, zip, need,
      service: /Solar/i.test(need) ? 'Solar' : /Electrical/i.test(need) ? 'Electrical' : 'Roofing',
      hasSolar: /Solar/i.test(need),
      timeline: 'ASAP', channel: 'Website — Estimate Form'
    });
    qf.innerHTML = '<div class="chat__done" style="margin-top:6px"><b>You\'re in — request #' + lead.id.slice(2, 6).toUpperCase() + '</b>' +
      'A Verified Guys specialist will reach out within 30 minutes to schedule your free, no-pressure estimate.</div>' +
      '<p class="form-note" style="margin-top:14px">Demo: open the <a href="crm.html" style="color:#00A87E;font-weight:700">Client Dashboard</a> to see this lead land in real time.</p>';
    toast('Request received — check the dashboard');
  });

  /* ══════════════ VERIFIED GUY AI ══════════════ */
  const chat = $('#chat'), body = $('#chatBody'), form = $('#chatForm'), input = $('#chatInput');

  const lead = { name: '', phone: '', zip: '', need: '', service: '', hasSolar: null, timeline: '', slot: '' };
  let step = 'start';
  let busy = false;

  function addMsg(text, who, chips, after) {
    const m = el('div', 'msg msg--' + who, text);
    body.appendChild(m);
    if (chips && chips.length) {
      const q = el('div', 'quick');
      chips.forEach(c => {
        const b = el('button', null, c.label || c);
        b.type = 'button';
        b.addEventListener('click', () => {
          if (busy) return;
          addMsg(c.label || c, 'me');
          (c.action || (() => handle(String(c.label || c))))();
        });
        q.appendChild(b);
      });
      body.appendChild(q);
    }
    body.scrollTop = body.scrollHeight;
    if (after) after();
  }

  function botSay(text, chips, delay) {
    busy = true;
    const t = el('div', 'typing', '<i></i><i></i><i></i>');
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      t.remove();
      addMsg(text, 'bot', chips);
      busy = false;
    }, delay || 620);
  }

  const SLOTS = [
    { d: 'Tomorrow', t: '9:30 AM', full: 'Tomorrow, 9:30 AM' },
    { d: 'Tomorrow', t: '1:00 PM', full: 'Tomorrow, 1:00 PM' },
    { d: 'Thu', t: '10:15 AM', full: 'Thursday, 10:15 AM' },
    { d: 'Fri', t: '8:00 AM', full: 'Friday, 8:00 AM' }
  ];

  function offerSlots() {
    const m = el('div', 'msg msg--bot', 'Here are the next openings. Pick one and an owner confirms it by text.');
    body.appendChild(m);
    const grid = el('div', 'chat__slots');
    SLOTS.forEach(s => {
      const b = el('button', null, s.t + '<span>' + s.d + ' · free walkthrough</span>');
      b.type = 'button';
      b.addEventListener('click', () => {
        addMsg(s.full, 'me');
        lead.slot = s.full;
        finish();
      });
      grid.appendChild(b);
    });
    body.appendChild(grid);
    body.scrollTop = body.scrollHeight;
  }

  function finish() {
    const saved = store.addLead({
      name: lead.name, phone: lead.phone, zip: lead.zip,
      need: lead.need, service: lead.service, hasSolar: lead.hasSolar,
      timeline: lead.timeline || 'Not stated',
      slot: lead.slot, channel: 'Website — AI Chat'
    });
    botSay('Locked in, ' + (lead.name.split(' ')[0] || 'friend') + '. Walkthrough booked for <b>' + lead.slot + '</b>.<br><br>Justin or Micah will text you beforehand. You\'ll get a confirmation with what to expect.', null, 700);
    setTimeout(() => {
      const done = el('div', 'chat__done');
      done.innerHTML = '<b>Lead #' + saved.id.slice(2, 6).toUpperCase() + ' created</b>' +
        'Logged to the CRM with source, ZIP, need, score (' + saved.score + '), and the booked slot. ' +
        '<a href="crm.html" style="color:#046B52;font-weight:800;text-decoration:underline">Open the live dashboard →</a>';
      body.appendChild(done);
      body.scrollTop = body.scrollHeight;
      toast('Walkthrough booked — lead sent to CRM');
    }, 1500);
  }

  function askPhone() {
    step = 'phone';
    botSay('Perfect. Best number to text your confirmation?', null, 540);
  }

  function handle(text) {
    const t = text.toLowerCase().trim();

    // intent answers, available at any point
    if (/warrant/.test(t)) {
      return botSay('Your solar warranty is safe. Our in-house techs are certified on Tesla, SolarEdge, Enphase, SMA, Franklin, and SolArk, and we follow manufacturer spec exactly. One warranty covers the roof and the solar.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/cost|price|how much|estimate|quote|\$/.test(t)) {
      return botSay('Depends on roof size and whether we\'re detaching solar. Repairs usually land a few hundred to a couple thousand. A full roof with solar detach/reset typically runs five figures. The walkthrough gives you a firm number — free, no pressure, no obligation.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/how long|timeline|days|weeks|fast/.test(t)) {
      return botSay('Most residential roofs are done in 3-7 days including solar detach and reset, because one crew runs the whole schedule. Insurance jobs and tile can run longer.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/insurance|storm|claim/.test(t)) {
      return botSay('Yes — we work with all major carriers and handle documentation through completion. We can usually be on site within 48 hours for storm damage.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/licens|roc|bond|insured/.test(t)) {
      return botSay('Fully licensed, bonded, and insured. ROC #358547 for roofing and ROC #361063 for electrical — that dual license is why we can legally do both the roof and your solar.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/battery|powerwall|tesla.*(batt|charger)|ev charger/.test(t)) {
      return botSay('Yes. We install Tesla Powerwall, Enphase, Franklin, and SolArk, plus EV chargers and panel upgrades through our electrical license.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/electrical|panel|rewire|outlet/.test(t)) {
      return botSay('We do full electrical: panel upgrades, whole-home rewiring, EV chargers, and troubleshooting. Licensed electricians, not a roofer with a side hustle.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/tile|shingle|foam|metal|tpo|roof type|what kind/.test(t)) {
      return botSay('We install asphalt shingle, tile (concrete and clay), foam, elastomeric coating, wood-shake, standing seam metal, and TPO — all specced for Arizona heat and monsoon.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }
    if (/financ|payment|afford/.test(t)) {
      return botSay('Financing options come up on the walkthrough — we walk through what fits rather than pushing a lender at you. Nothing is signed on site.', [
        { label: 'Book a walkthrough', action: startNeed }
      ]);
    }

    // conversation flow
    if (/^(hi|hey|hello|yo)\b/.test(t) && step === 'start') return startNeed();

    if (step === 'need') {
      if (/roof/.test(t) && /solar/.test(t)) return needSet('Roof + Solar Detach/Reset', 'Roofing', true);
      if (/roof|shingle|tile|leak|repair/.test(t)) { lead.need = 'Roof Replacement'; lead.service = 'Roofing'; return askSolar(); }
      if (/solar|battery|panel/.test(t)) { lead.need = 'Solar & Battery'; lead.service = 'Solar'; lead.hasSolar = false; return askTimeline(); }
      if (/electric|panel|charger|wiring/.test(t)) { lead.need = 'Electrical'; lead.service = 'Electrical'; lead.hasSolar = false; return askTimeline(); }
      if (/not sure|unsure|both|everything/.test(t)) return needSet('Roof + Solar Detach/Reset', 'Roofing', true);
      if (/just looking|pricing|info/.test(t)) return botSay('No problem. What are you trying to figure out — roof, solar, or electrical?', [
        { label: 'Roof', action: () => { lead.need = 'Roof Replacement'; lead.service = 'Roofing'; askSolar(); } },
        { label: 'Solar', action: () => { lead.need = 'Solar & Battery'; lead.service = 'Solar'; lead.hasSolar = false; askTimeline(); } },
        { label: 'Electrical', action: () => { lead.need = 'Electrical'; lead.service = 'Electrical'; lead.hasSolar = false; askTimeline(); } }
      ]);
      return needSet('Roof + Solar Detach/Reset', 'Roofing', true);
    }

    if (step === 'solar') {
      if (/^(yes|yeah|yep|i do|have them)/.test(t)) { lead.hasSolar = true; return askTimeline(); }
      if (/^(no|nope|none|don)/.test(t)) { lead.hasSolar = false; return askTimeline(); }
      lead.hasSolar = true; return askTimeline();
    }

    if (step === 'timeline') {
      if (/asap|urgent|now|soon|leak/.test(t)) lead.timeline = 'ASAP';
      else if (/1-3|month|next/.test(t)) lead.timeline = '1-3 months';
      else lead.timeline = 'Just pricing';
      return askZip();
    }

    if (step === 'zip') {
      const m = t.match(/\b(\d{5})\b/);
      lead.zip = m ? m[1] : t.slice(0, 12);
      return askName();
    }

    if (step === 'name') {
      lead.name = text.trim().slice(0, 60);
      return askPhone();
    }

    if (step === 'phone') {
      lead.phone = text.trim().slice(0, 24);
      return askAddress();
    }

    if (step === 'address') {
      lead.address = text.trim().slice(0, 120);
      return askEmail();
    }

    if (step === 'email') {
      lead.email = text.trim().slice(0, 80);
      botSay('Got it — checking the estimate calendar…', null, 500);
      return setTimeout(offerSlots, 1100);
    }

    if (step === 'slots') return offerSlots();

    return botSay('I can help with roof, solar, electrical, warranty, timeline, or pricing questions — or get you straight onto the schedule.', [
      { label: 'Book a walkthrough', action: startNeed },
      { label: 'What does it cost?', action: () => handle('how much') }
    ]);
  }

  function needSet(needLabel, service, hasSolar) {
    lead.need = needLabel; lead.service = service; lead.hasSolar = hasSolar;
    return askTimeline();
  }

  function askSolar() {
    step = 'solar';
    botSay('Do you have solar panels on that roof?', [
      { label: 'Yes, I have solar', action: () => { lead.hasSolar = true; addMsg('Yes, I have solar', 'me'); askTimeline(); } },
      { label: 'No solar', action: () => { lead.hasSolar = false; addMsg('No solar', 'me'); askTimeline(); } }
    ]);
  }

  function askTimeline() {
    step = 'timeline';
    botSay('How soon are you looking to get this done?', [
      { label: 'ASAP', action: () => { lead.timeline = 'ASAP'; askZip(); } },
      { label: 'In 1-3 months', action: () => { lead.timeline = '1-3 months'; askZip(); } },
      { label: 'Just pricing', action: () => { lead.timeline = 'Just pricing'; askZip(); } }
    ]);
  }

  function askZip() {
    step = 'zip';
    botSay('What ZIP code is the property in?', null, 520);
  }

  function askName() {
    step = 'name';
    botSay('Perfect — and your name?', null, 520);
  }

  function askAddress() {
    step = 'address';
    botSay('What\'s the property address? Micah and Justin pull the roof up on satellite before they come out.', null, 520);
  }

  function askEmail() {
    step = 'email';
    botSay('And an email for the written estimate?', null, 520);
  }

  function startNeed() {
    step = 'need';
    botSay('What can we look at for you?', [
      { label: 'Roof + solar', action: () => needSet('Roof + Solar Detach/Reset', 'Roofing', true) },
      { label: 'Roof only', action: () => { lead.need = 'Roof Replacement'; lead.service = 'Roofing'; askSolar(); } },
      { label: 'EV charger', action: () => { lead.need = 'EV Charger Install'; lead.service = 'Electrical'; lead.hasSolar = false; askTimeline(); } },
      { label: 'Electrical', action: () => { lead.need = 'Electrical'; lead.service = 'Electrical'; lead.hasSolar = false; askTimeline(); } },
      { label: 'Solar or battery', action: () => { lead.need = 'Solar & Battery'; lead.service = 'Solar'; lead.hasSolar = false; askTimeline(); } }
    ]);
  }

  function openChat(greet) {
    if (!chat) return;
    chat.classList.add('open');
    const fab = $('#chatFab'); if (fab) fab.style.display = 'none';
    if (!body.dataset.started) {
      body.dataset.started = '1';
      botSay('Hey — Micah and Justin here, the owners of The Verified Guys. Tell me what you\'re looking at and I\'ll get an estimate on the books, usually within 24 to 48 hours.', [
        { label: 'I need a roof', action: () => needSet('Roof Replacement', 'Roofing', true) },
        { label: 'Solar or battery', action: () => needSet('Solar & Battery', 'Solar', false) },
        { label: 'EV charger or electrical', action: () => needSet('EV Charger Install', 'Electrical', false) },
        { label: 'Book a walkthrough', action: startNeed }
      ], 300);
    } else if (greet) {
      botSay(greet, null, 280);
    }
    setTimeout(() => input && input.focus(), 400);
  }

  function closeChat() {
    chat.classList.remove('open');
    const fab = $('#chatFab'); if (fab) fab.style.display = '';
  }

  if ($('#chatFab')) $('#chatFab').addEventListener('click', () => openChat());
  if ($('#chatClose')) $('#chatClose').addEventListener('click', closeChat);
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim(); if (!v || busy) return;
    addMsg(v, 'me'); input.value = '';
    handle(v);
  });

  // proactive engagement, like the brief asked for
  let engaged = false;
  // pop the conversation after 3s on the page
  setTimeout(() => {
    if (!engaged && !chat.classList.contains('open')) openChat();
  }, 3000);
  setTimeout(() => {
    if (!engaged && !chat.classList.contains('open')) {
      const fab = $('#chatFab');
      if (fab) {
        const n = el('span', 'chat-fab__n', '1');
        fab.appendChild(n);
        fab.style.animation = 'none';
        setTimeout(() => { fab.style.transform = 'translateY(-4px)'; }, 60);
        setTimeout(() => { fab.style.transform = ''; }, 900);
      }
    }
  }, 7000);

  window.addEventListener('scroll', () => { engaged = true; }, { once: true });

  window.VG = { store, chat: { open: openChat, close: closeChat }, toast };
})();
