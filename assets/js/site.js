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

  /* ---- prefill contact form from ?interest= (sponsor tier / in-kind CTAs) ---- */
  var messageField = document.getElementById('message');
  if (messageField) {
    var interest = new URLSearchParams(window.location.search).get('interest');
    if (interest && !messageField.value) {
      messageField.value = "I'm interested in " + interest + ". ";
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

  /* ---- result pages: pick the copy that matches the query string ---- */
  var variantRoot = document.querySelector('[data-variants]');
  if (variantRoot) {
    var wanted = new URLSearchParams(window.location.search).get(variantRoot.getAttribute('data-param'));
    var variants = variantRoot.querySelectorAll('[data-variant]');
    var known = false;
    variants.forEach(function (el) { if (el.getAttribute('data-variant') === wanted) known = true; });
    if (!known) wanted = variantRoot.getAttribute('data-default');
    variants.forEach(function (el) { el.hidden = el.getAttribute('data-variant') !== wanted; });
  }

  /* ---- sponsor application form ---- */
  var sponsorForm = document.getElementById('sponsor-form');
  if (sponsorForm) {
    var sfStatus = document.getElementById('sponsor-form-status');
    var sfSubmit = sponsorForm.querySelector('button[type="submit"]');
    var sfAmount = document.getElementById('sf-amount');
    var sfTier = document.getElementById('sf-tier');
    var sfLogo = document.getElementById('sf-logo');
    var MAX_LOGO = 4 * 1024 * 1024;
    var EMAIL = 'thecosmicmicrowave35817@gmail.com';

    // Mirrors tierForAmount in the team app; the server decides for real.
    function tierName(amount) {
      if (!isFinite(amount) || amount < 100) return null;
      if (amount >= 2500) return 'Universe';
      if (amount >= 1000) return 'Galaxy';
      if (amount >= 500) return 'Star';
      if (amount >= 250) return 'Planet';
      return 'Meteor';
    }

    function parseAmount() {
      return Number(String(sfAmount.value).replace(/[$,\s]/g, ''));
    }

    function showTier() {
      if (!sfAmount.value.trim()) { sfTier.textContent = 'Enter $100 or more to see your tier.'; return; }
      var name = tierName(parseAmount());
      sfTier.textContent = name ? name + ' tier' : 'Sponsorships start at $100.';
    }

    function currentKind() {
      return sponsorForm.querySelector('input[name="kind"]:checked').value;
    }

    function showKind() {
      var sponsorship = currentKind() === 'sponsorship';
      sponsorForm.querySelector('[data-kind-panel="sponsorship"]').hidden = !sponsorship;
      sponsorForm.querySelector('[data-kind-panel="other"]').hidden = sponsorship;
      sfSubmit.textContent = sponsorship ? 'Send application' : 'Send offer';
    }

    function clearErrors() {
      sponsorForm.querySelectorAll('[data-error-for]').forEach(function (el) { el.textContent = ''; });
      sponsorForm.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    }

    function showErrors(fields) {
      var first = null;
      Object.keys(fields).forEach(function (name) {
        var slot = sponsorForm.querySelector('[data-error-for="' + name + '"]');
        if (slot) slot.textContent = fields[name];
        var input = sponsorForm.querySelector('[name="' + name + '"]');
        if (input) { input.setAttribute('aria-invalid', 'true'); if (!first) first = input; }
      });
      if (first) first.focus();
    }

    function setStatus(text, kind) {
      sfStatus.textContent = text;
      sfStatus.className = 'form-status' + (kind ? ' is-' + kind : '');
    }

    function localCheck() {
      var fields = {};
      var value = function (name) { return sponsorForm.elements[name].value.trim(); };
      if (!value('company')) fields.company = 'Company name is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) fields.email = 'Enter a valid email address.';
      if (currentKind() === 'sponsorship') {
        var amount = parseAmount();
        if (!value('amount') || !isFinite(amount)) fields.amount = 'Enter an amount in dollars.';
        else if (amount < 100) fields.amount = 'Sponsorships start at $100. For a smaller gift, use the donate page.';
      } else if (!value('description')) {
        fields.description = 'Tell us what you would like to offer.';
      }
      var file = sfLogo.files && sfLogo.files[0];
      if (file && file.size > MAX_LOGO) fields.logo = 'Logo must be 4 MB or smaller.';
      return fields;
    }

    // Turnstile tokens are single-use: get a fresh one after any failure.
    function resetChallenge() {
      if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
    }

    // Only ever navigate to a real web address. Anything else (javascript:,
    // data:, a malformed value) is treated as a failed submission.
    function safeRedirect(value) {
      if (typeof value !== 'string' || !value) return null;
      try {
        var url = new URL(value, window.location.href);
        var local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) return url.href;
      } catch (e) {}
      return null;
    }

    document.querySelectorAll('[data-apply-kind]').forEach(function (link) {
      link.addEventListener('click', function () {
        var kind = link.getAttribute('data-apply-kind');
        var radio = sponsorForm.querySelector('input[name="kind"][value="' + kind + '"]');
        if (radio) radio.checked = true;
        var amount = link.getAttribute('data-apply-amount');
        if (amount) sfAmount.value = amount;
        showKind();
        showTier();
      });
    });

    sponsorForm.querySelectorAll('input[name="kind"]').forEach(function (radio) {
      radio.addEventListener('change', showKind);
    });
    sfAmount.addEventListener('input', showTier);
    showKind();
    showTier();

    sponsorForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var problems = localCheck();
      if (Object.keys(problems).length) {
        showErrors(problems);
        setStatus('Please fix the highlighted fields.', 'error');
        return;
      }

      sfSubmit.disabled = true;
      setStatus('Sending…', 'pending');

      fetch(sponsorForm.action, { method: 'POST', body: new FormData(sponsorForm) })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) { return { status: res.status, body: body }; });
        })
        .then(function (result) {
          var target = result.status === 200 ? safeRedirect(result.body.redirect) : null;
          if (target !== null) {
            setStatus('Sent. One moment…', 'success');
            window.location.assign(target);
            return;
          }
          resetChallenge();
          sfSubmit.disabled = false;
          if (result.body.error === 'validation' && result.body.fields) {
            showErrors(result.body.fields);
            setStatus(result.body.fields.form || 'Please fix the highlighted fields.', 'error');
          } else if (result.body.error === 'verification') {
            setStatus('We could not verify you are human. Complete the check above and try again.', 'error');
          } else if (result.status === 429) {
            setStatus('Too many applications from this connection. Try again in an hour or email ' + EMAIL + '.', 'error');
          } else {
            setStatus('Could not send. Email us at ' + EMAIL + '.', 'error');
          }
        })
        .catch(function () {
          resetChallenge();
          sfSubmit.disabled = false;
          setStatus('Could not send. Check your connection, or email us at ' + EMAIL + '.', 'error');
        });
    });
  }
})();
