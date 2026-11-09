/* Verified Guy AI — standalone widget for interior pages.
   Self-contained: injects its own markup, reuses site.css chat styles,
   and writes leads into the same localStorage the dashboard reads. */
(function () {
  if (window.__vgChatLoaded) return;
  window.__vgChatLoaded = true;

  var LEADS_KEY = 'vg_demo_leads_v1';
  var SEEDED_KEY = 'vg_demo_seeded_v1';

  function read(k, fb) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v === null ? fb : v; }
    catch (e) { return fb; }
  }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 8); }

  function scoreOf(l) {
    var s = 40;
    if (/ASAP/i.test(l.timeline || '')) s += 25;
    if (/1-3/i.test(l.timeline || '')) s += 12;
    if (l.hasSolar) s += 10;
    if (/Detach|Replacement|Battery/i.test(l.need || '')) s += 10;
    return Math.min(97, s);
  }

  function saveLead(data) {
    var leads = read(LEADS_KEY, []);
    var lead = Object.assign({
      id: uid('L'),
      createdAt: new Date().toISOString(),
      status: 'New',
      source: 'Website',
      channel: 'Website — AI Chat',
      value: 0
    }, data);
    lead.score = scoreOf(lead);
    leads.unshift(lead);
    write(LEADS_KEY, leads);
    write(SEEDED_KEY, read(SEEDED_KEY, false));
    try { window.dispatchEvent(new CustomEvent('vg:lead', { detail: lead })); } catch (e) {}
    return lead;
  }

  /* ── markup ───────────────────────────────────────────── */
  var fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.id = 'vgChatFab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Open the Verified Guy AI chat');
  fab.innerHTML = '<span class="chat-fab__dot"></span>' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M21 12a8 8 0 1 1-3.2-6.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M21 4v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var panel = document.createElement('div');
  panel.className = 'chat';
  panel.id = 'vgChat';
  panel.innerHTML =
    '<div class="chat__head">' +
      '<div class="chat__av">VG</div>' +
      '<div><div class="chat__t">The Verified Guy</div>' +
      '<div class="chat__s"><span class="live"></span> Online now · replies instantly</div></div>' +
      '<button class="chat__x" id="vgChatX" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div class="chat__body" id="vgChatBody"></div>' +
    '<form class="chat__foot" id="vgChatForm">' +
      '<input id="vgChatInput" type="text" placeholder="Type your answer…" autocomplete="off" aria-label="Message">' +
      '<button class="chat__send" type="submit" aria-label="Send">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"/></svg>' +
      '</button>' +
    '</form>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var body = panel.querySelector('#vgChatBody');
  var input = panel.querySelector('#vgChatInput');
  var busy = false;
  var opened = false;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function addMsg(text, who, chips) {
    var m = el('div', 'msg msg--' + who, text);
    body.appendChild(m);
    if (chips && chips.length) {
      var q = el('div', 'quick');
      chips.forEach(function (c) {
        var b = el('button', null, c.label);
        b.type = 'button';
        b.addEventListener('click', function () {
          if (busy) return;
          addMsg(c.label, 'me');
          c.act();
        });
        q.appendChild(b);
      });
      body.appendChild(q);
    }
    body.scrollTop = body.scrollHeight;
  }

  function botSay(text, chips, delay) {
    busy = true;
    var t = el('div', 'typing', '<i></i><i></i><i></i>');
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    setTimeout(function () {
      t.remove();
      addMsg(text, 'bot', chips);
      busy = false;
    }, delay || 620);
  }

  var SLOTS = [
    { d: 'Tomorrow', t: '9:30 AM', full: 'Tomorrow, 9:30 AM' },
    { d: 'Tomorrow', t: '1:00 PM', full: 'Tomorrow, 1:00 PM' },
    { d: 'Thu', t: '10:15 AM', full: 'Thursday, 10:15 AM' },
    { d: 'Fri', t: '8:00 AM', full: 'Friday, 8:00 AM' }
  ];

  var lead = { hasSolar: false };

  function offerSlots() {
    var m = el('div', 'msg msg--bot', 'Here are the next openings. Pick one and an owner confirms it by text.');
    body.appendChild(m);
    var grid = el('div', 'chat__slots');
    SLOTS.forEach(function (s) {
      var b = el('button', null, s.t + '<span>' + s.d + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () {
        lead.slot = s.full;
        addMsg(s.full, 'me');
        confirmBooking();
      });
      grid.appendChild(b);
    });
    body.appendChild(grid);
    body.scrollTop = body.scrollHeight;
    busy = false;
  }

  function confirmBooking() {
    botSay('Locked in — ' + lead.slot + '.', null, 500);
    setTimeout(function () {
      saveLead(lead);
      addMsg(
        '<strong>You\u2019re on the schedule, ' + (lead.name || 'neighbor').split(' ')[0] + '.</strong><br>' +
        'A Verified Guys specialist will confirm by text shortly, and we\u2019ll bring material samples to the walkthrough. ' +
        'Anything else I can answer before then?',
        'bot'
      );
    }, 1100);
  }

  function askNeed() {
    addMsg('Quick one before you go \u2014 what are you looking to get done?', 'bot', [
      { label: 'Roof replacement', act: function () { setNeed('Roof Replacement'); } },
      { label: 'Roof + solar detach/reset', act: function () { setNeed('Roof + Solar Detach/Reset', true); } },
      { label: 'EV charger install', act: function () { setNeed('EV Charger Install'); } },
      { label: 'Electrical work', act: function () { setNeed('Electrical Services'); } },
      { label: 'Solar or battery install', act: function () { setNeed('Solar & Battery'); } },
      { label: 'Just have a question', act: answerGeneral }
    ]);
  }

  function setNeed(need, solarKnown) {
    lead.need = need;
    lead.service = /Electrical|EV/i.test(need) ? 'Electrical'
      : /Solar & Battery/i.test(need) ? 'Solar'
      : 'Roofing';
    if (solarKnown) {
      lead.hasSolar = true;
      askTimeline();
    } else {
      botSay('Do you already have solar panels on that roof?', [
        { label: 'Yes, I have solar', act: function () { lead.hasSolar = true; askTimeline(); } },
        { label: 'No solar', act: function () { lead.hasSolar = false; askTimeline(); } }
      ], 520);
    }
  }

  function askTimeline() {
    botSay('Got it. How soon are you looking to get this handled?', [
      { label: 'ASAP', act: function () { lead.timeline = 'ASAP'; askZip(); } },
      { label: '1-3 months', act: function () { lead.timeline = '1-3 months'; askZip(); } },
      { label: 'Just pricing for now', act: function () { lead.timeline = 'Just pricing'; askZip(); } }
    ], 520);
  }

  function askZip() {
    botSay('What ZIP code is the property in?', null, 480);
    lead._expect = 'zip';
  }

  function askName() {
    botSay('Perfect. What name should I put on the walkthrough?', null, 480);
    lead._expect = 'name';
  }

  function askAddress() {
    botSay('What\u2019s the property address? Micah and Justin look the roof up on satellite before they roll a truck.', null, 480);
    lead._expect = 'address';
  }

  function askEmail() {
    botSay('And an email for the written estimate?', null, 480);
    lead._expect = 'email';
  }

  function askPhone() {
    botSay('Last thing \u2014 best mobile number for the confirmation text?', null, 480);
    lead._expect = 'phone';
  }

  function answerGeneral() {
    lead.need = lead.need || 'General question';
    botSay('Happy to help. What\u2019s the question? I can cover cost, timelines, insurance claims, or what happens to your solar panels during a roof replacement.', null, 480);
    lead._expect = 'question';
  }

  function handle(text) {
    var v = String(text || '').trim();
    if (!v) return;

    if (lead._expect === 'zip') {
      var z = v.replace(/[^0-9]/g, '').slice(0, 5);
      if (z.length !== 5) { botSay('That ZIP looks short \u2014 can you send all five digits?', null, 400); return; }
      lead.zip = z;
      lead._expect = null;
      askName();
      return;
    }
    if (lead._expect === 'name') {
      lead.name = v.replace(/[^\w\s'.-]/g, '').trim() || 'Homeowner';
      lead._expect = null;
      askPhone();
      return;
    }
    if (lead._expect === 'phone') {
      var digits = v.replace(/[^0-9]/g, '');
      if (digits.length < 10) { botSay('I only caught part of that \u2014 can you resend the full number?', null, 400); return; }
      lead.phone = v;
      askAddress();
      return;
    }
    if (lead._expect === 'address') {
      lead.address = v.slice(0, 120);
      askEmail();
      return;
    }
    if (lead._expect === 'email') {
      lead.email = v.slice(0, 80);
      lead._expect = null;
      botSay('Thanks. Checking the estimate calendar now\u2026', null, 600);
      setTimeout(offerSlots, 1300);
      return;
    }
    if (lead._expect === 'question') {
      lead.question = v;
      lead._expect = null;
      var q = v.toLowerCase();
      var a;
      if (/cost|price|how much|quote|estimate/.test(q)) {
        a = 'Walkthroughs are free and there\u2019s no obligation. For a roof replacement with solar detach and reset, most Phoenix homes land in the range where the solar work is included rather than billed separately \u2014 that\u2019s the part other companies mark up. I\u2019d rather give you a real number after seeing the roof than guess.';
      } else if (/warrant|guarantee/.test(q)) {
        a = 'One warranty covering both the roof and the solar work, because it\u2019s one company doing both. No finger-pointing between a roofer and a solar installer.';
      } else if (/how long|timeline|days|weeks/.test(q)) {
        a = 'Most roof replacements run three to seven days depending on size and pitch. Solar detach and reset is built into that window so your system isn\u2019t down for weeks.';
      } else if (/insurance|claim|storm|monsoon/.test(q)) {
        a = 'Yes \u2014 we work storm and insurance claims and document the damage for the adjuster.';
      } else if (/license|bond|roc/.test(q)) {
        a = 'We\u2019re dual licensed, roofing and electrical: ROC #358547 and ROC #361063. Licensed, bonded, and insured, and veteran owned.';
      } else if (/panel|battery|tesla|powerwall/.test(q)) {
        a = 'We install new solar and any battery system on the market \u2014 Tesla, Enphase, Franklin, SolArk and more \u2014 and we handle removals and resets for existing systems.';
      } else {
        a = 'Good question, and I\u2019d rather have Micah or Justin answer it properly than guess. Want me to put you on the walkthrough schedule so you can ask them directly?';
      }
      botSay(a, [
        { label: 'Yes, book a walkthrough', act: function () { if (!lead.need) lead.need = 'General question'; if (lead.need === 'General question') { askTimeline(); } else { askZip(); } } },
        { label: 'Ask something else', act: answerGeneral }
      ], 700);
      return;
    }

    // free text fallback
    var t2 = v.toLowerCase();
    if (/book|schedule|appointment|walkthrough|estimate/.test(t2)) {
      if (!lead.need) { askNeed(); return; }
      askZip(); return;
    }
    if (/roof/.test(t2)) { setNeed(/solar/.test(t2) ? 'Roof + Solar Detach/Reset' : 'Roof Replacement', /solar/.test(t2)); return; }
    if (/electric|panel upgrade|ev charger/.test(t2)) { setNeed('Electrical Services'); return; }
    if (/solar|battery/.test(t2)) { setNeed('Solar & Battery'); return; }
    answerGeneral();
  }

  function greetProactive() {
    addMsg(
      'Hey \u2014 Micah and Justin here, the owners of The Verified Guys. Looking for a roof, solar, or electrical estimate? ' +
      'Takes about 30 seconds and we can usually get someone out within 24 to 48 hours.',
      'bot',
      [
        { label: 'Yes, book me in', act: askNeed },
        { label: 'I have a question', act: answerGeneral },
        { label: 'Just browsing', act: function () { botSay('No problem. I\u2019ll be right here in the corner if anything comes up.', null, 420); } }
      ]
    );
  }

  function open(auto) {
    if (opened) return;
    opened = true;
    panel.classList.add('open');
    fab.style.display = 'none';
    if (!body.children.length) greetProactive();
    setTimeout(function () { if (!auto) input.focus(); }, 400);
  }

  function close() {
    panel.classList.remove('open');
    opened = false;
    fab.style.display = 'flex';
  }

  fab.addEventListener('click', function () { open(false); });
  panel.querySelector('#vgChatX').addEventListener('click', close);
  panel.querySelector('#vgChatForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v || busy) return;
    addMsg(v, 'me');
    input.value = '';
    handle(v);
  });

  // show the launcher right away, then auto-open the conversation at 3s
  setTimeout(function () { open(true); }, 3000);

  window.VGChat = { open: function () { open(false); }, close: close };
})();
