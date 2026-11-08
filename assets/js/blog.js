/* UK Electricals blog helpers: category filter, search, share links, copy link.
   Event delegation on document, so it also works when the single-file edition swaps pages in and out. No libraries. */
(function () {
  'use strict';
  if (window.__ukeBlog) return;
  window.__ukeBlog = true;
  var d = document;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  function applyFilter() {
    var grid = d.getElementById('bgrid');
    if (!grid) return;
    var pressed = d.querySelector('.bfilters button[aria-pressed="true"]');
    var cat = pressed ? pressed.getAttribute('data-cat') : 'all';
    var box = d.getElementById('bsearch');
    var q = box ? box.value.toLowerCase().trim() : '';
    var shown = 0;
    $$('.bcard', grid).forEach(function (c) {
      var ok = (cat === 'all' || c.getAttribute('data-cat') === cat) && (!q || (c.getAttribute('data-q') || '').indexOf(q) > -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    var e = d.getElementById('bempty');
    if (e) e.classList.toggle('on', shown === 0);
    var live = d.getElementById('bcount');
    if (live) live.textContent = shown === 1 ? '1 article shown' : shown + ' articles shown';
  }

  d.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t.closest) return;
    var f = t.closest('.bfilters button');
    if (f) {
      $$('.bfilters button').forEach(function (b) { b.setAttribute('aria-pressed', b === f ? 'true' : 'false'); });
      applyFilter();
      return;
    }
    var s = t.closest('a[data-share]');
    if (s) {
      var page = (location.protocol.indexOf('http') === 0) ? location.href.split('#')[0] : s.getAttribute('data-url');
      var u = encodeURIComponent(page), tx = encodeURIComponent(s.getAttribute('data-title') || '');
      var k = s.getAttribute('data-share');
      s.href = k === 'wa' ? 'https://wa.me/?text=' + tx + '%20' + u
        : k === 'fb' ? 'https://www.facebook.com/sharer/sharer.php?u=' + u
        : k === 'x' ? 'https://twitter.com/intent/tweet?text=' + tx + '&url=' + u
        : 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
      return;
    }
    var c = t.closest('button[data-copy]');
    if (c) {
      var page2 = (location.protocol.indexOf('http') === 0) ? location.href.split('#')[0] : c.getAttribute('data-url');
      var done = function (ok) {
        var old = c.getAttribute('data-label') || c.textContent;
        c.setAttribute('data-label', old);
        c.textContent = ok ? 'Link copied' : 'Copy failed';
        setTimeout(function () { c.textContent = old; }, 1800);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(page2).then(function () { done(true); }, function () { done(false); }); }
        else { done(false); }
      } catch (e) { done(false); }
    }
  });
  d.addEventListener('input', function (ev) { if (ev.target && ev.target.id === 'bsearch') applyFilter(); });
})();
