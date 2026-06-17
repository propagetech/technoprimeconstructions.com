/* TechnoPrime Constructions  -  progressive enhancement only.
   The site is fully functional with JavaScript disabled:
   navigation uses real links, the FAQ uses native <details>, the gallery
   links open the full images, and the contact page shows a direct mailto
   link. This file adds the mobile menu, a gentle scroll reveal, a
   full-screen gallery carousel, and an optional mailto draft composer.
   Nothing here sends or stores any data. */
(function () {
  'use strict';

  /* ---- Scroll reveal (run first so nothing can block it) ---------------- */
  try {
    var reveals = document.querySelectorAll('.reveal');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reveals.length && 'IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(function (el) {
        el.classList.add('reveal--armed');
        io.observe(el);
      });
    }
  } catch (err) { /* leave content visible */ }

  /* ---- Mobile navigation ------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) try {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('data-open', String(open));
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    // Close on Escape and return focus to the toggle.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    // Close when a link is chosen or when clicking outside the header.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !e.target.closest('.nav') ) {
        setOpen(false);
      }
    });
    // Reset state when resizing up to desktop.
    var mq = window.matchMedia('(min-width: 861px)');
    var onChange = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (err) { /* nav enhancement is optional */ }

  /* ---- Gallery lightbox / carousel (full screen, autoplay, thumbnails,
          slow ken-burns zoom on each image) ---------------------------- */
  try {
    var IMG_RE = /\.(webp|jpe?g|png|gif|avif)(\?.*)?$/i;
    var galLinks = [].slice.call(document.querySelectorAll('.gallery a'))
      .filter(function (a) { return IMG_RE.test(a.getAttribute('href') || ''); });

    if (galLinks.length) {
      var slides = galLinks.map(function (a) {
        var im = a.querySelector('img');
        var cap = a.querySelector('figcaption');
        return {
          full: a.getAttribute('href'),
          thumb: (im && im.getAttribute('src')) || a.getAttribute('href'),
          alt: (im && im.getAttribute('alt')) || '',
          caption: (cap && cap.textContent.trim()) || (im && im.getAttribute('alt')) || ''
        };
      });

      var SVG = {
        play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5.2v13.6a1 1 0 0 0 1.52.85l11-6.8a1 1 0 0 0 0-1.7l-11-6.8A1 1 0 0 0 7 5.2z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
        expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
        compress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M16 21v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6l-12 12"/></svg>',
        prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
        next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
      };

      var DELAY = 4500;
      var n = slides.length;
      var index = 0, playing = false, timer = null, lastFocus = null;

      var lb = document.createElement('div');
      lb.className = 'lb';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Gallery image viewer');
      lb.tabIndex = -1;
      lb.hidden = true;
      lb.innerHTML =
        '<div class="lb-toolbar">' +
          '<span class="lb-counter" aria-live="polite"></span>' +
          '<div class="lb-tools">' +
            '<button class="lb-btn lb-play" type="button"></button>' +
            '<button class="lb-btn lb-full" type="button"></button>' +
            '<button class="lb-btn lb-close" type="button" aria-label="Close (Escape)">' + SVG.close + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="lb-main">' +
          '<button class="lb-nav lb-prev" type="button" aria-label="Previous image">' + SVG.prev + '</button>' +
          '<figure class="lb-stage"><span class="lb-imgwrap"><img class="lb-img" alt="" decoding="async"></span><figcaption class="lb-caption"></figcaption></figure>' +
          '<button class="lb-nav lb-next" type="button" aria-label="Next image">' + SVG.next + '</button>' +
        '</div>' +
        '<div class="lb-thumbs" aria-label="Gallery thumbnails"></div>';
      document.body.appendChild(lb);

      var elImg = lb.querySelector('.lb-img');
      var elCap = lb.querySelector('.lb-caption');
      var elCount = lb.querySelector('.lb-counter');
      var elPlay = lb.querySelector('.lb-play');
      var elFull = lb.querySelector('.lb-full');
      var elClose = lb.querySelector('.lb-close');
      var elPrev = lb.querySelector('.lb-prev');
      var elNext = lb.querySelector('.lb-next');
      var elMain = lb.querySelector('.lb-main');
      var elThumbs = lb.querySelector('.lb-thumbs');

      var thumbBtns = slides.map(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lb-thumb';
        b.setAttribute('aria-label', 'Go to image ' + (i + 1) + (s.caption ? ': ' + s.caption : ''));
        var t = document.createElement('img');
        t.src = s.thumb; t.alt = ''; t.loading = 'lazy';
        b.appendChild(t);
        b.addEventListener('click', function () { go(i); });
        elThumbs.appendChild(b);
        return b;
      });

      function preload(i) { var im = new Image(); im.src = slides[i].full; }

      function render() {
        var s = slides[index];
        elImg.src = s.full;
        elImg.alt = s.alt;
        elCap.textContent = s.caption;
        elCap.style.display = s.caption ? '' : 'none';
        elCount.textContent = (index + 1) + ' / ' + n;
        /* restart the slow ken-burns zoom for the freshly shown image */
        elImg.classList.remove('is-zooming');
        void elImg.offsetWidth;
        elImg.classList.add('is-zooming');
        thumbBtns.forEach(function (b, i) {
          if (i === index) { b.setAttribute('aria-current', 'true'); b.scrollIntoView({ block: 'nearest', inline: 'center' }); }
          else b.removeAttribute('aria-current');
        });
        preload((index + 1) % n);
        preload((index - 1 + n) % n);
      }

      function go(i) {
        index = (i % n + n) % n;
        render();
        if (playing) { clearInterval(timer); timer = setInterval(next, DELAY); }
      }
      function next() { go(index + 1); }
      function prev() { go(index - 1); }

      function setPlay(on) {
        playing = on;
        elPlay.innerHTML = on ? SVG.pause : SVG.play;
        elPlay.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
        elPlay.setAttribute('aria-pressed', String(on));
        if (timer) { clearInterval(timer); timer = null; }
        if (on) timer = setInterval(next, DELAY);
      }

      function setFullIcon() {
        var fs = !!document.fullscreenElement;
        elFull.innerHTML = fs ? SVG.compress : SVG.expand;
        elFull.setAttribute('aria-label', fs ? 'Exit full screen' : 'Full screen');
      }
      function toggleFull() {
        try {
          if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen(); }
          else if (lb.requestFullscreen) lb.requestFullscreen();
        } catch (e) { /* fullscreen is optional */ }
      }

      function open(i) {
        lastFocus = document.activeElement;
        lb.hidden = false;
        document.documentElement.classList.add('lb-lock');
        setFullIcon();
        setPlay(false);
        go(i);
        lb.focus();
      }
      function close() {
        setPlay(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          try { document.exitFullscreen(); } catch (e) {}
        }
        lb.hidden = true;
        document.documentElement.classList.remove('lb-lock');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      galLinks.forEach(function (a, i) {
        a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
      });

      elPrev.addEventListener('click', prev);
      elNext.addEventListener('click', next);
      elPlay.addEventListener('click', function () { setPlay(!playing); });
      elFull.addEventListener('click', toggleFull);
      elClose.addEventListener('click', close);
      elMain.addEventListener('click', function (e) { if (e.target === elMain) close(); });
      document.addEventListener('fullscreenchange', setFullIcon);

      // touch swipe on the image area
      var sx = null;
      elMain.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      elMain.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 44) { if (dx < 0) next(); else prev(); }
        sx = null;
      }, { passive: true });

      document.addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        else if (e.key === ' ' || e.key === 'Spacebar') {
          if (e.target && e.target.tagName === 'BUTTON') return; // let the focused button act
          e.preventDefault(); setPlay(!playing);
        } else if (e.key === 'Tab') {
          var f = [].slice.call(lb.querySelectorAll('button'));
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1], ae = document.activeElement;
          if (e.shiftKey && (ae === first || ae === lb)) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && ae === last) { e.preventDefault(); first.focus(); }
        }
      });
    }
  } catch (err) { /* gallery enhancement is optional */ }

  /* ---- Click-to-load map (privacy/perf-friendly facade) ----------------- */
  /* Without JS the .map-embed is a plain link to Google Maps. With JS, the
     click is intercepted and the interactive iframe is loaded in place, so
     no third-party map code runs until the visitor actually asks for it. */
  try {
    var maps = document.querySelectorAll('.map-embed[data-map-embed]');
    [].forEach.call(maps, function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var src = el.getAttribute('data-map-embed');
        if (!src) return;
        var wrap = document.createElement('div');
        wrap.className = 'map-embed is-loaded';
        var f = document.createElement('iframe');
        f.src = src;
        f.title = el.getAttribute('data-map-title') || 'Location map';
        f.loading = 'lazy';
        f.setAttribute('allowfullscreen', '');
        f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        f.style.border = '0';
        wrap.appendChild(f);
        el.replaceWith(wrap);
        f.focus();
      });
    });
  } catch (err) { /* map facade is optional; the link still works */ }

  /* ---- Contact: compose a mailto draft from the visitor's own mail app -- */
  var form = document.getElementById('draft-form');
  if (form) {
    var to = form.getAttribute('data-email') || '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (n) {
        var f = form.elements[n];
        return f ? String(f.value || '').trim() : '';
      };
      var name = get('name');
      var company = get('company');
      var topic = get('topic');
      var message = get('message');
      var replyTo = get('email');

      var subject = topic ? ('TechnoPrime enquiry: ' + topic) : 'TechnoPrime enquiry';
      var lines = [];
      if (message) lines.push(message, '');
      lines.push('---');
      if (name) lines.push('Name: ' + name);
      if (company) lines.push('Company: ' + company);
      if (replyTo) lines.push('Email: ' + replyTo);
      if (topic) lines.push('Topic: ' + topic);

      var href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;

      var note = document.getElementById('draft-note');
      if (note) note.hidden = false;
    });
  }
})();
