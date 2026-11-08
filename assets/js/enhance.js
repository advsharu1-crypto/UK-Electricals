/* UK Electricals: bottom navigation, enquiry popup, floating-button tweaks.
   Loaded after main.js. main.js is not modified.

   BACKEND INTEGRATION POINT
   The popup posts to the same endpoint as the page enquiry forms: EMAIL_ENDPOINT in build.py.
   build.py writes that value into CFG.endpoint below when it copies this file to dist/.
   While it is empty, the popup does NOT claim anything was sent. It prepares a WhatsApp message instead.
   The success message is shown only when the server answers HTTP 2xx with {"ok":true} or {"success":true}.
   Do not put API keys or secrets here: use a form service endpoint that needs none, or your own server. */
(function () {
  'use strict';
  if (window.__ukeEnhance) return;
  window.__ukeEnhance = true;

  var CFG = { endpoint: '', tel: '+918248391838', phone: '082483 91838', wa: '918248391838' };
  var SPA = !!window.UKE_SPA;
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- routes: reuse whatever routing the page already uses ---------- */
  function keyOf(href) {
    href = String(href || '').split('#');
    var h = SPA ? '#' + (href[1] || '') : href[0];
    if (!SPA) h = h.replace(/^https?:\/\/[^\/]+/, '').replace(/index\.html$/, '');
    return h.replace(/^#/, '').replace(/^\/+|\/+$/g, '').split('/')[0];
  }
  function currentKey() {
    return SPA ? keyOf(location.hash.replace(/^#\/?/, '#/')) : location.pathname.replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '').split('/')[0];
  }
  var links = $$('.header a[href], footer a[href]');
  function exists(key) { return links.some(function (a) { return keyOf(a.getAttribute('href')) === key; }); }
  function hrefFor(key) { return key ? (SPA ? '#/' + key : '/' + key + '/') : (SPA ? '#/' : '/'); }

  var svc = $$('#dd-s a[href]').map(function (a) {
    return { key: keyOf(a.getAttribute('href')), href: a.getAttribute('href'), name: a.textContent.trim() };
  }).filter(function (s) { return s.key && s.key !== 'services'; });
  function isExtra(s) { return s.key === 'plumbing-services' || /^ac-/.test(s.key); }
  var svcKeys = {}; svc.forEach(function (s) { svcKeys[s.key] = 1; });

  var MORE = [['about-us', 'About Us'], ['projects', 'Projects'], ['service-areas', 'Service Areas'], ['contact-us', 'Contact Us'],
              ['privacy-policy', 'Privacy Policy'], ['terms-and-conditions', 'Terms & Conditions']].filter(function (m) { return exists(m[0]); });
  var moreKeys = {}; MORE.forEach(function (m) { moreKeys[m[0]] = 1; });

  /* ---------- icons ---------- */
  function ico(p) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }
  var I = {
    home: ico('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
    svc: ico('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
    book: ico('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 15l2.2 2.2L15.5 13"/>'),
    contact: ico('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3.5" y="13" width="4" height="6" rx="1.5"/><rect x="16.5" y="13" width="4" height="6" rx="1.5"/><path d="M18.5 19c0 1.5-2.2 2-5 2"/>'),
    more: ico('<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>'),
    close: ico('<path d="M6 6l12 12M18 6L6 18"/>')
  };

  /* ---------- build the bar, menus and popup once ---------- */
  var home = $('.header .logo');
  var homeHref = home ? home.getAttribute('href') : hrefFor('');
  function item(tag, attrs, icon, label, cls) {
    return '<li><' + tag + ' class="bn-it' + (cls ? ' ' + cls : '') + '" ' + attrs + '>' + icon + '<span>' + label + '</span></' + tag + '></li>';
  }
  function sheetList(arr) {
    return '<ul>' + arr.map(function (s) { return '<li><a href="' + esc(s.href) + '" data-k="' + esc(s.key) + '">' + esc(s.name) + '</a></li>'; }).join('') + '</ul>';
  }
  var elec = svc.filter(function (s) { return !isExtra(s); }), extra = svc.filter(isExtra);
  var svcHtml = '<h2 class="bn-sh-t">Electrical services</h2>' + sheetList(elec) + (extra.length ? '<h2 class="bn-sh-t">Plumbing and AC</h2>' + sheetList(extra) : '');
  var moreHtml = '<ul>' + MORE.map(function (m) { return '<li><a href="' + esc(hrefFor(m[0])) + '" data-k="' + m[0] + '">' + m[1] + '</a></li>'; }).join('') + '</ul>';

  function closeRow(label) { return '<div class="bn-sh-x"><button class="bn-x" type="button" aria-label="' + label + '">' + I.close + '</button></div>'; }
  var wrap = d.createElement('div');
  wrap.setAttribute('data-uke', 'bottom-nav');
  wrap.innerHTML =
    '<div class="bn-scrim" id="bn-scrim"></div>' +
    '<div class="bn-sheet" id="bn-svc" role="region" aria-label="Services">' + closeRow('Close services menu') + svcHtml + '</div>' +
    '<div class="bn-sheet" id="bn-more" role="region" aria-label="More pages">' + closeRow('Close more menu') + moreHtml + '</div>' +
    '<nav class="bn" id="bn" aria-label="Quick navigation"><ul>' +
    item('a', 'href="' + esc(homeHref) + '" data-k="home"', I.home, 'Home') +
    item('button', 'type="button" data-k="svc" aria-haspopup="true" aria-expanded="false" aria-controls="bn-svc"', I.svc, 'Services') +
    item('button', 'type="button" data-k="book" aria-haspopup="dialog" aria-label="Book now: open the enquiry form"', '<i class="bn-ico">' + I.book + '</i>', 'Book Now', 'bn-book') +
    (exists('contact-us') ? item('a', 'href="' + hrefFor('contact-us') + '" data-k="contact"', I.contact, 'Contact Us') : '') +
    item('button', 'type="button" data-k="more" aria-haspopup="true" aria-expanded="false" aria-controls="bn-more"', I.more, 'More') +
    '</ul></nav>';

  /* popup */
  function opt(s) { return '<option value="' + esc(s.key) + '">' + esc(s.name) + '</option>'; }
  var pq = d.createElement('div');
  pq.className = 'pq'; pq.id = 'pq'; pq.setAttribute('aria-hidden', 'true'); pq.setAttribute('data-uke', 'enquiry-popup');
  pq.innerHTML =
    '<div class="pq-dlg" role="dialog" aria-modal="true" aria-labelledby="pq-t" aria-describedby="pq-s" tabindex="-1">' +
    '<button class="pq-x" type="button" aria-label="Close enquiry form">' + I.close + '</button>' +
    '<div class="pq-hd"><h2 id="pq-t">Send an enquiry</h2><p id="pq-s">Tell us what you need. We will reply by phone or WhatsApp.</p></div>' +
    '<form id="pq-form" novalidate autocomplete="on">' +
    '<div class="pq-f"><label for="pq-name">Name <i aria-hidden="true">*</i></label><input id="pq-name" name="name" autocomplete="name" required><div class="pq-e" id="pq-name-e" aria-live="polite"></div></div>' +
    '<div class="pq-f"><label for="pq-email">Email (optional)</label><input id="pq-email" name="email" type="email" inputmode="email" autocomplete="email"><div class="pq-e" id="pq-email-e" aria-live="polite"></div></div>' +
    '<div class="pq-f"><label for="pq-phone">Phone <i aria-hidden="true">*</i></label><input id="pq-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="98765 43210" required><div class="pq-e" id="pq-phone-e" aria-live="polite"></div></div>' +
    '<div class="pq-f"><label for="pq-service">Service required <i aria-hidden="true">*</i></label><select id="pq-service" name="service" required><option value="">Choose a service</option>' +
      '<optgroup label="Electrical services">' + elec.map(opt).join('') + '</optgroup>' +
      (extra.length ? '<optgroup label="Plumbing and AC">' + extra.map(opt).join('') + '</optgroup>' : '') +
      '<option value="advice">Not sure, I need advice</option></select><div class="pq-e" id="pq-service-e" aria-live="polite"></div></div>' +
    '<div class="pq-f pq-full"><label for="pq-msg">Description</label><textarea id="pq-msg" name="message" rows="3" placeholder="Briefly describe your requirement..."></textarea></div>' +
    '<div class="pq-hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
    '<p class="pq-st" id="pq-st" role="status" tabindex="-1"></p>' +
    '<button class="pq-go" type="submit">Send Enquiry</button>' +
    '<p class="pq-note">We use these details only to reply to your enquiry. See the privacy policy' + (exists('privacy-policy') ? ': <a href="' + hrefFor('privacy-policy') + '">Privacy Policy</a>' : '') + '. This sends an enquiry, not a confirmed booking.</p>' +
    '</form></div>';

  d.body.appendChild(wrap);
  d.body.appendChild(pq);
  root.classList.add('bn-on');

  /* the floating WhatsApp message now covers all services, not only electrical */
  $$('.float .fw').forEach(function (a) {
    a.setAttribute('href', 'https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent('Hello UK Electricals, I would like to enquire about your services in Chennai.'));
  });

  /* ---------- menus ---------- */
  var bn = $('#bn'), scrim = $('#bn-scrim');
  var sheets = { svc: $('#bn-svc'), more: $('#bn-more') };
  var btn = {}; $$('.bn-it[data-k]', bn).forEach(function (b) { btn[b.getAttribute('data-k')] = b; });
  var openSheet = null;

  function setSheet(name, on, returnFocus) {
    if (!sheets[name]) return;
    sheets[name].classList.toggle('on', on);
    btn[name].setAttribute('aria-expanded', String(on));
    if (on) { openSheet = name; scrim.classList.add('on'); }
    else { if (openSheet === name) openSheet = null; if (!openSheet) scrim.classList.remove('on'); if (returnFocus) btn[name].focus(); }
  }
  function closeSheets(returnFocus) { ['svc', 'more'].forEach(function (n) { if (sheets[n].classList.contains('on')) setSheet(n, false, returnFocus); }); }
  function toggleSheet(name) {
    var on = !sheets[name].classList.contains('on');
    closeSheets(false);
    if (on) { setSheet(name, true); }
  }
  function openFromButton(name, e) {
    toggleSheet(name);
    /* keyboard activation (Enter/Space gives detail 0): move focus into the menu so arrow keys work */
    if (e && e.detail === 0 && sheets[name].classList.contains('on')) {
      var first = $$('a', sheets[name])[0];
      if (first) { try { first.focus({ preventScroll: true }); } catch (x) { first.focus(); } }
    }
  }
  btn.svc.addEventListener('click', function (e) { openFromButton('svc', e); });
  btn.more.addEventListener('click', function (e) { openFromButton('more', e); });
  scrim.addEventListener('click', function () { closeSheets(false); });
  $$('.bn-x').forEach(function (x) { x.addEventListener('click', function () { closeSheets(true); }); });
  ['svc', 'more'].forEach(function (n) {
    sheets[n].addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) closeSheets(false); });
    sheets[n].addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var a = $$('a', sheets[n]), i = a.indexOf(d.activeElement);
      e.preventDefault();
      a[(i + (e.key === 'ArrowDown' ? 1 : -1) + a.length) % a.length].focus();
    });
  });
  btn.home.addEventListener('click', function (e) {
    closeSheets(false);
    if (currentKey() === '') { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
  });
  if (btn.contact) btn.contact.addEventListener('click', function () { closeSheets(false); });

  /* current page */
  function setActive() {
    var k = currentKey();
    var map = { home: k === '', contact: k === 'contact-us', svc: k === 'services' || !!svcKeys[k], more: (!!moreKeys[k] && k !== 'contact-us') || /^electrician-/.test(k) };
    Object.keys(map).forEach(function (n) {
      var b = btn[n]; if (!b) return;
      if (b.tagName === 'A') { if (map[n]) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }
      else b.classList.toggle('is-active', map[n]);
    });
    $$('.bn-sheet a').forEach(function (a) { if (a.getAttribute('data-k') === k) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  setActive();
  window.addEventListener(SPA ? 'hashchange' : 'pageshow', function () { closeSheets(false); setActive(); });

  /* ---------- popup ---------- */
  var form = $('#pq-form', pq), dlg = $('.pq-dlg', pq), stat = $('#pq-st', pq), submitBtn = $('.pq-go', pq);
  var popupOpen = false, lastFocus = null, pointerOnBackdrop = false;
  var SEEN = 'uke_popup_seen', memSeen = false;
  function seen() { try { return sessionStorage.getItem(SEEN) === '1'; } catch (e) { return memSeen; } }
  function markSeen() { memSeen = true; try { sessionStorage.setItem(SEEN, '1'); } catch (e) {} }

  function lock(on) {
    if (on) {
      var sbw = window.innerWidth - root.clientWidth;
      root.style.paddingRight = sbw > 0 ? sbw + 'px' : '';
      root.classList.add('bn-lock');
    } else { root.classList.remove('bn-lock'); root.style.paddingRight = ''; }
  }
  function fit() { var v = window.visualViewport; if (v) pq.style.setProperty('--pq-vh', v.height + 'px'); }
  function preselect() {
    var k = currentKey(), s = $('#pq-service', pq);
    if (s.value) return;
    if (svcKeys[k]) s.value = k;
  }
  function openPopup() {
    if (popupOpen) return;
    closeSheets(false);
    popupOpen = true; markSeen();
    lastFocus = d.activeElement;
    preselect(); fit(); lock(true);
    pq.classList.add('on'); pq.setAttribute('aria-hidden', 'false');
    window.setTimeout(function () { var f = $('#pq-name', pq); if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } } }, reduce ? 0 : 60);
  }
  function closePopup() {
    if (!popupOpen) return;
    popupOpen = false;
    pq.classList.remove('on'); pq.setAttribute('aria-hidden', 'true'); lock(false);
    if (lastFocus && lastFocus.focus && d.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { lastFocus.focus(); } }
  }
  btn.book.addEventListener('click', openPopup);
  $('.pq-x', pq).addEventListener('click', closePopup);
  pq.addEventListener('pointerdown', function (e) { pointerOnBackdrop = e.target === pq; });
  pq.addEventListener('click', function (e) { if (e.target === pq && pointerOnBackdrop) closePopup(); pointerOnBackdrop = false; });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { if (popupOpen) fit(); });
  form.addEventListener('focusin', function (e) {
    if (e.target.matches && e.target.matches('input,select,textarea')) window.setTimeout(function () { try { e.target.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (x) {} }, 250);
  });
  var anyLink = $('.pq-note a', pq); if (anyLink) anyLink.addEventListener('click', closePopup);

  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (popupOpen) { e.preventDefault(); closePopup(); }
      else if (openSheet) { e.preventDefault(); closeSheets(true); }
    } else if (e.key === 'Tab' && popupOpen) {
      var f = $$('a[href],button:not([disabled]),input:not([tabindex="-1"]):not([disabled]),select,textarea', dlg).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (d.activeElement === first || d.activeElement === dlg)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- validation (same rules as the page forms) ---------- */
  var rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name.'; },
    email: function (v) { if (!v.trim()) return ''; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address, for example name@example.com.'; },
    phone: function (v) { var x = v.replace(/[\s\-()]/g, ''); return /^(\+?91|0)?[6-9]\d{9}$/.test(x) || /^0\d{9,11}$/.test(x) || /^\+(?!91)\d{10,14}$/.test(x) ? '' : 'Enter a valid phone number, for example 98765 43210.'; },
    service: function (v) { return v ? '' : 'Choose a service.'; }
  };
  function check(el) {
    var r = rules[el.name]; if (!r) return true;
    var m = r(el.value), e = $('#pq-' + el.name + '-e', pq);
    el.classList.toggle('bad', !!m); if (m) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    if (e) { e.textContent = m; el.setAttribute('aria-describedby', m ? e.id : ''); if (!m) el.removeAttribute('aria-describedby'); }
    return !m;
  }
  ['name', 'email', 'phone', 'service'].forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener('blur', function () { if (el.value || el.classList.contains('bad')) check(el); });
    el.addEventListener('input', function () { if (el.classList.contains('bad')) check(el); });
  });
  function say(type, html) { stat.className = 'pq-st ' + type; stat.innerHTML = html; try { stat.focus({ preventScroll: true }); } catch (e) {} if (stat.scrollIntoView) stat.scrollIntoView({ block: 'nearest' }); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, firstBad = null;
    ['name', 'email', 'phone', 'service'].forEach(function (n) { var el = form.elements[n]; if (!check(el)) { ok = false; firstBad = firstBad || el; } });
    if (!ok) { stat.className = 'pq-st'; stat.textContent = ''; firstBad.focus(); return; }
    if (form.elements.website.value) return; /* honeypot */
    var sel = form.elements.service, svcName = sel.options[sel.selectedIndex].text;
    var data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), phone: form.elements.phone.value.trim(),
                 service: svcName, message: form.elements.message.value.trim(), source: 'popup form', page: location.href };
    var kind = /plumb/i.test(svcName) ? 'a plumbing service' : /\bAC\b/.test(svcName) ? 'an AC service' : 'an electrical service';
    if (sel.value === 'advice') kind = 'advice about a service';
    var text = 'Hello UK Electricals, I would like to request ' + kind + '.\nName: ' + data.name + '\nPhone: ' + data.phone + (data.email ? '\nEmail: ' + data.email : '') +
               '\nService: ' + svcName + (data.message ? '\nDetails: ' + data.message : '');
    var wa = 'https://wa.me/' + CFG.wa + '?text=' + encodeURIComponent(text);
    var call = '<a href="tel:' + CFG.tel + '">' + esc(CFG.phone) + '</a>';
    var waBtn = '<a class="pq-wa" href="' + wa + '" target="_blank" rel="noopener">Send on WhatsApp</a>';

    if (!CFG.endpoint) {
      say('info', '<strong>Your enquiry is ready, but it has not been sent yet.</strong> This website has no form server connected, so send it by WhatsApp or call us on ' + call + '.<br>' + waBtn);
      return;
    }
    submitBtn.disabled = true;
    fetch(CFG.endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) {
        if (!r.ok) throw new Error('bad status');
        return r.json().then(function (j) { return j; }, function () { return null; });
      })
      .then(function (j) {
        if (j && (j.ok === true || j.success === true)) {
          say('ok', '<strong>Enquiry received.</strong> If you have not heard back, call ' + call + ' or message us on WhatsApp.');
          form.reset(); sel.value = '';
        } else {
          say('fail', 'We could not confirm that your enquiry was received. Please call ' + call + ' or send it on WhatsApp.<br>' + waBtn);
        }
      })
      .catch(function () { say('fail', 'The enquiry could not be sent. Call ' + call + ' or send it on WhatsApp.<br>' + waBtn); })
      .then(function () { submitBtn.disabled = false; });
  });

  /* ---------- automatic popup: once per session, 10 seconds after the page has loaded ---------- */
  var timer = null;
  function menuOpen() { var n = $('.nav.open'); return !!n; }
  function tryAuto() {
    timer = null;
    if (seen() || popupOpen) return;
    if (d.hidden) { d.addEventListener('visibilitychange', function once() { if (!d.hidden) { d.removeEventListener('visibilitychange', once); schedule(500); } }); return; }
    var a = d.activeElement;
    var typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !pq.contains(a);
    if (openSheet || menuOpen() || typing) { schedule(3000); return; }  /* never interrupt the visitor */
    openPopup();
  }
  function schedule(ms) { if (seen() || timer) return; timer = window.setTimeout(tryAuto, ms); }
  if (d.readyState === 'complete') schedule(10000);
  else window.addEventListener('load', function () { schedule(10000); }, { once: true });
})();
