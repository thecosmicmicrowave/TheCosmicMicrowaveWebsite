(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile nav ---- */
  var navToggle = document.getElementById('nav-toggle');
  var navList = document.getElementById('nav-links');

  function setNav(open) {
    if (!navToggle || !navList) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  }

  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  /* ---- support dropdown ---- */
  var supportToggle = document.getElementById('support-toggle');
  if (supportToggle) {
    supportToggle.addEventListener('click', function () {
      var open = supportToggle.getAttribute('aria-expanded') === 'true';
      supportToggle.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__item--drop')) {
        supportToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Escape closes whatever is open ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (supportToggle && supportToggle.getAttribute('aria-expanded') === 'true') {
      supportToggle.setAttribute('aria-expanded', 'false');
      supportToggle.focus();
      return;
    }
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---- header shadow on scroll ---- */
  var header = document.getElementById('site-header');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 50);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- animated stat counters ---- */
  var stats = document.querySelectorAll('[data-count]');
  if (stats.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      stats.forEach(function (el) { el.textContent = el.dataset.count; });
    } else {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.dataset.count, 10);
          var start = performance.now();
          (function step(now) {
            var p = Math.min((now - start) / 1600, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
          })(start);
          obs.unobserve(el);
        });
      }, { threshold: 0.4 });
      stats.forEach(function (el) { obs.observe(el); });
    }
  }

  /* ---- contact form submit states ---- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit.disabled = true;
      form.classList.add('is-sending');
      status.textContent = 'Sending…';
      status.className = 'form-status is-pending';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        status.textContent = 'Message sent. We will get back to you soon.';
        status.className = 'form-status is-success';
      }).catch(function () {
        status.textContent = 'Could not send. Email us directly at thecosmicmicrowave35817@gmail.com.';
        status.className = 'form-status is-error';
      }).finally(function () {
        submit.disabled = false;
        form.classList.remove('is-sending');
      });
    });
  }
})();
