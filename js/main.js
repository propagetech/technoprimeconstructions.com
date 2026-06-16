/* CouncelX  -  progressive enhancement only.
   The site is fully functional with JavaScript disabled:
   navigation uses real links, the FAQ uses native <details>, and the
   contact page shows a direct mailto link. This file adds the mobile
   menu, a gentle scroll reveal, and an optional mailto draft composer.
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

      var subject = topic ? ('CouncelX enquiry: ' + topic) : 'CouncelX enquiry';
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
