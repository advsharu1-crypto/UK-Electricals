/* UK Electricals — shared behaviour (no dependencies) */
(function () {
  'use strict';
  window.UKM = 1;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- header (bound once) ---------- */
  var header = $('.header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 20); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var nav = $('#site-nav'), burger = $('.head-cta .burger'), scrim = $('.scrim');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    if (scrim) scrim.classList.toggle('on', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : ''; document.body.classList.toggle('menu-open', open);
    if (open) { var f = $('.nav-close', nav); if (f) f.focus(); } else if (document.activeElement && nav.contains(document.activeElement)) burger.focus();
  }
  /* date fields: earliest date is today (the built value would go stale) */
  (function () { var t = new Date(), m = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); $$('input[type="date"]').forEach(function (i) { i.min = m; }); })();
  /* keep Tab inside the open menu panel */
  if (nav) nav.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !nav.classList.contains('open')) return;
    var f = [].slice.call(nav.querySelectorAll('a[href],button')).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (burger) burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('.nav-close,.scrim').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });

  var dds = $$('.has-dd');
  function closeAll(except) {
    dds.forEach(function (d) {
      if (d !== except) { d.classList.remove('open'); var b = $('button.nl', d); if (b) b.setAttribute('aria-expanded', 'false'); }
    });
  }
  dds.forEach(function (d) {
    var b = $('button.nl', d);
    b.addEventListener('click', function () {
      var open = !d.classList.contains('open');
      closeAll(d); d.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    });
    d.addEventListener('mouseenter', function () { if (window.innerWidth >= 1280 && !nav.classList.contains('open')) b.setAttribute('aria-expanded', 'true'); });
    d.addEventListener('mouseleave', function () { if (window.innerWidth >= 1280 && !nav.classList.contains('open') && !d.classList.contains('open')) b.setAttribute('aria-expanded', 'false'); });
    d.addEventListener('focusout', function (e) { if (!d.contains(e.relatedTarget) && window.innerWidth >= 1280 && !nav.classList.contains('open')) { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-dd')) closeAll(); });

  /* ---------- footer service areas accordion (links are real anchors in the HTML; this only toggles visibility) ---------- */
  $$('.fareas').forEach(function (fa) {
    var faBtn = $('.fa-btn', fa);
    if (faBtn) faBtn.addEventListener('click', function () {
      var open = !fa.classList.contains('open');
      fa.classList.toggle('open', open); faBtn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- lightbox state (document-level handlers bound once) ---------- */
  var lb = null, lbImg, lbCap, items = [], cur = 0, lastFocus;
  function visible() { return items.filter(function (i) { return !i.hidden; }); }
  function lbShow(i) {
    var v = visible(); if (!v.length) return;
    cur = (i + v.length) % v.length;
    var it = v[cur]; lbImg.src = $('img', it).src; lbImg.alt = $('img', it).alt; lbCap.textContent = it.getAttribute('data-cap');
  }
  function lbOpen(it) {
    lastFocus = document.activeElement; lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false');
    lbShow(visible().indexOf(it)); $('.x', lb).focus(); document.body.style.overflow = 'hidden';
  }
  function lbClose() {
    if (!lb || !lb.classList.contains('on')) return;
    lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var openDd = dds.filter(function (d) { return d.classList.contains('open'); })[0];
      if (nav && nav.classList.contains('open')) { closeAll(); setMenu(false); }
      else if (openDd) { closeAll(); $('button.nl', openDd).focus(); }
      lbClose();
    }
    if (lb && lb.classList.contains('on')) {
      if (e.key === 'ArrowLeft') lbShow(cur - 1);
      if (e.key === 'ArrowRight') lbShow(cur + 1);
    }
  });

  /* ---------- page-specific behaviour (re-run after every page render) ---------- */
  var io = null;
  function initPage() {
    /* scroll reveal */
    var AUTO = ['.sec-head', '.hero .ctas', '.trust li', '.faq details', '.rel a', '.chips li', '.gi', '.tcard', '.cinfo', '.cform', '.band .wrap > div', '.aside',
      '.prose > h2', '.areas > *', '.steps li', '.mapbox', '.about .pic', '.about > div'];
    /* paired blocks enter from opposite sides (left block from the left, right block from the right) */
    $$('.split, .about, .cgrid').forEach(function (g) {
      if (g.closest('.lb')) return;
      var k = Array.prototype.filter.call(g.children, function (c) { return c.nodeType === 1; });
      if (k.length !== 2 || k[0].classList.contains('rv-l') || k[0].classList.contains('rv-r')) return;
      var a = k[0].getBoundingClientRect().left <= k[1].getBoundingClientRect().left ? [k[0], k[1]] : [k[1], k[0]];
      a[0].classList.add('rv', 'rv-l'); a[1].classList.add('rv', 'rv-r');
      a[0].style.setProperty('--i', 0); a[1].style.setProperty('--i', 1);
    });
    $$(AUTO.join(',')).forEach(function (el) {
      if (el.classList.contains('rv') || el.closest('.lb')) return;
      el.classList.add('rv');
      if (!el.style.getPropertyValue('--i')) {
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.tagName === el.tagName; });
        el.style.setProperty('--i', Math.min(sibs.indexOf(el), 5));
      }
    });
    $$('.hero-grid > div:first-child > *, .phero-grid > div:first-child > *').forEach(function (el, i) { el.style.setProperty('--h', Math.min(i, 5)); });
    var rv = $$('.rv');
    if (io) io.disconnect();
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) {
          var t = en.target; t.classList.add('in'); io.unobserve(t);
          /* once revealed, drop the animation classes so hover transitions are not delayed */
          window.setTimeout(function () { t.classList.remove('rv', 'in', 'rv-l', 'rv-r'); t.style.removeProperty('--i'); }, 1300);
        } });
      }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
      rv.forEach(function (el) { io.observe(el); });
    } else { rv.forEach(function (el) { el.classList.add('in'); }); }

    /* hero breakers switch on */
    var board = $('.board');
    if (board) window.setTimeout(function () { board.classList.add('is-live'); }, 500);

    $$('.yr').forEach(function (n) { n.textContent = new Date().getFullYear(); });

    /* gallery filter + lightbox */
    var fbtns = $$('.filters button');
    items = $$('.gi'); lb = $('.lb');
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        fbtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var c = b.getAttribute('data-f');
        items.forEach(function (it) { it.hidden = !(c === 'all' || it.getAttribute('data-c') === c); });
      });
    });
    if (lb) {
      lbImg = $('img', lb); lbCap = $('figcaption', lb);
      items.forEach(function (it) { it.addEventListener('click', function () { lbOpen(it); }); });
      $('.x', lb).addEventListener('click', lbClose);
      $('.p', lb).addEventListener('click', function () { lbShow(cur - 1); });
      $('.n', lb).addEventListener('click', function () { lbShow(cur + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    }

    /* enquiry form */
    var form = $('#enquiry-form');
    if (!form) return;
    var status = $('.fstatus', form);
    var WA = form.getAttribute('data-wa');
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your full name.'; },
      phone: function (v) { var d = v.replace(/[\s\-()]/g, ''); return /^(\+?91|0)?[6-9]\d{9}$/.test(d) || /^0\d{9,11}$/.test(d) || /^\+(?!91)\d{10,14}$/.test(d) ? '' : 'Enter a valid phone number, for example 98765 43210.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address or leave this blank.'; },
      service: function (v) { return v ? '' : 'Choose the service you need.'; },
      ptype: function (v) { return v ? '' : 'Choose a property type.'; },
      location: function (v) { return v.trim() ? '' : 'Enter the area or locality.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Describe the work in at least 10 characters.'; }
    };
    function check(el) {
      var f = el.closest('.field'); if (!f || !rules[el.name]) return true;
      var m = rules[el.name](el.value), e = $('.err', f);
      f.classList.toggle('bad', !!m); e.textContent = m; el.setAttribute('aria-invalid', m ? 'true' : 'false');
      return !m;
    }
    $$('input,select,textarea', form).forEach(function (el) { el.addEventListener('blur', function () { check(el); }); });
    function say(cls, html) { status.className = 'fstatus on ' + cls; status.innerHTML = html; status.focus(); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$('input,select,textarea', form).forEach(function (el) { if (rules[el.name] && !check(el)) { ok = false; first = first || el; } });
      var c = $('#consent', form), ce = $('.consent-err', form);
      if (!c.checked) { ok = false; ce.textContent = 'Tick this box so we can use your details to reply.'; first = first || c; } else ce.textContent = '';
      if (!ok) { say('fail', 'Check the highlighted fields and send again.'); if (first) first.focus(); return; }
      if ($('.hp input', form).value) return; /* honeypot: silently drop bots */
      var d = {}; $$('input,select,textarea', form).forEach(function (el) { if (el.name) d[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
      var kind = /plumb/i.test(d.service) ? 'a plumbing service' : /\bAC\b/.test(d.service) ? 'an AC service' : 'an electrical service';
      var text = 'Hello UK Electricals, I would like to request ' + kind + '.\n' +
        'Name: ' + d.name + '\nPhone: ' + d.phone + (d.email ? '\nEmail: ' + d.email : '') +
        '\nService: ' + d.service + '\nProperty: ' + d.ptype + '\nLocation: ' + d.location +
        (d.date ? '\nPreferred date: ' + d.date : '') + (d.time ? '\nPreferred time: ' + d.time : '') + '\nDetails: ' + d.message;
      var wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
      if (!endpoint) {
        /* No backend configured: never claim the enquiry was sent. */
        say('info', '<strong>Your enquiry is ready, but it has not been sent yet.</strong> This website has no form server connected, so send it by WhatsApp or call us on <a href="tel:+918248391838">082483 91838</a>.<br><br><a class="btn btn-w btn-sm" href="' + wa + '" target="_blank" rel="noopener">Send on WhatsApp</a>');
        return;
      }
      var btn = $('button[type=submit]', form); btn.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          /* Success is shown only when the backend explicitly confirms it ({"ok":true} or {"success":true}). A bare HTTP 200 is not enough. */
          return r.json().then(function (j) { return j; }, function () { return null; });
        })
        .then(function (j) {
          if (j && (j.ok === true || j.success === true)) {
            say('ok', '<strong>Enquiry received.</strong> If you have not heard back, call <a href="tel:+918248391838">082483 91838</a> or message us on WhatsApp.'); form.reset();
          } else {
            say('fail', 'We could not confirm that your enquiry was received. Please call <a href="tel:+918248391838">082483 91838</a> or <a href="' + wa + '" target="_blank" rel="noopener">send it on WhatsApp</a>.');
          }
        })
        .catch(function () { say('fail', 'The enquiry could not be sent. Call <a href="tel:+918248391838">082483 91838</a> or <a href="' + wa + '" target="_blank" rel="noopener">send it on WhatsApp</a>.'); })
        .then(function () { btn.disabled = false; });
    });
  }

  window.UKE = { initPage: initPage, closeMenu: function () { setMenu(false); closeAll(); } };
  if (!window.UKE_SPA) initPage();
})();
