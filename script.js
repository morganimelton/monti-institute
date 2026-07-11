'use strict';

document.addEventListener('DOMContentLoaded', function() {

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     1. NAV: SCROLL BORDER
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  var navEl = document.getElementById('js-nav');
  if (navEl) {
    window.addEventListener('scroll', function() {
      navEl.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     2. NAV: MOBILE TOGGLE (ADA)
     - aria-expanded on button
     - focus moves into menu on open
     - focus returns to button on close
     - Escape closes menu
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  (function initMobileNav() {
    var btn  = document.getElementById('js-nav-toggle');
    var list = document.getElementById('js-nav-list');
    if (!btn || !list) return;

    function openMenu() {
      btn.setAttribute('aria-expanded', 'true');
      list.classList.add('is-open');
      // Move focus to first focusable item in menu
      var firstItem = list.querySelector('a, button');
      if (firstItem) firstItem.focus();
    }

    function closeMenu(returnFocus) {
      btn.setAttribute('aria-expanded', 'false');
      list.classList.remove('is-open');
      if (returnFocus) btn.focus();
    }

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (btn.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!list.classList.contains('is-open')) return;
      var nav = document.getElementById('js-nav');
      if (nav && !nav.contains(e.target)) closeMenu(false);
    });

    // Escape closes menu
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && list.classList.contains('is-open')) {
        closeMenu(true);
      }
    });

    // Close when a link is clicked
    list.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu(false);
      });
    });
  })();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     3. NAV: DROPDOWN MENUS (ADA)
     - aria-expanded on toggle buttons
     - Arrow keys navigate within dropdown
     - Escape closes dropdown, returns focus to toggle
     - Tab out of dropdown closes it
     - Enter/Space opens dropdown
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  (function initDropdowns() {
    var items = Array.from(document.querySelectorAll('.nav__item--dropdown'));

    function closeAll(exceptItem) {
      items.forEach(function(item) {
        if (item === exceptItem) return;
        item.removeAttribute('data-open');
        var t = item.querySelector('.nav__dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    function openDropdown(item, toggle) {
      closeAll(item);
      item.setAttribute('data-open', '');
      toggle.setAttribute('aria-expanded', 'true');
      // Move focus to first dropdown link
      var firstLink = item.querySelector('.nav__dropdown-link');
      if (firstLink) firstLink.focus();
    }

    function closeDropdown(item, toggle, returnFocus) {
      item.removeAttribute('data-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus && toggle) toggle.focus();
    }

    items.forEach(function(item) {
      var toggle = item.querySelector('.nav__dropdown-toggle');
      var dropdown = item.querySelector('.nav__dropdown');
      if (!toggle || !dropdown) return;

      // Click / Enter / Space opens dropdown
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (item.hasAttribute('data-open')) {
          closeDropdown(item, toggle, true);
        } else {
          openDropdown(item, toggle);
        }
      });

      // Keyboard navigation within dropdown
      var links = Array.from(dropdown.querySelectorAll('.nav__dropdown-link'));

      links.forEach(function(link, idx) {
        link.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            e.preventDefault();
            closeDropdown(item, toggle, true);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            var next = links[idx + 1];
            if (next) next.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var prev = links[idx - 1];
            if (prev) prev.focus();
            else toggle.focus();
          } else if (e.key === 'Tab' && idx === links.length - 1 && !e.shiftKey) {
            // Tab out of last item — close dropdown
            closeDropdown(item, toggle, false);
          } else if (e.key === 'Tab' && idx === 0 && e.shiftKey) {
            // Shift+Tab out of first item — close and return focus
            closeDropdown(item, toggle, false);
          }
        });
      });

      // Toggle keyboard
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' && item.hasAttribute('data-open')) {
          e.preventDefault();
          var firstLink = dropdown.querySelector('.nav__dropdown-link');
          if (firstLink) firstLink.focus();
        } else if (e.key === 'Escape') {
          closeDropdown(item, toggle, true);
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav__item--dropdown')) {
        closeAll(null);
      }
    });
  })();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     4. SCROLL PROGRESS BAR + BACK TO TOP
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  (function initScrollProgress() {
    var prog = document.getElementById('scroll-progress');
    var btt  = document.getElementById('back-to-top');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        var el      = document.documentElement;
        var scrolled = el.scrollTop || document.body.scrollTop;
        var total    = el.scrollHeight - el.clientHeight;
        var pct      = total > 0 ? (scrolled / total) * 100 : 0;
        if (prog) {
          prog.style.width = pct.toFixed(1) + '%';
          prog.classList.toggle('is-visible', scrolled > 60);
        }
        if (btt) btt.classList.toggle('is-visible', pct > 30);
        ticking = false;
      });
    }

    if (btt) {
      btt.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Return focus to top of page for screen readers
        var skipLink = document.getElementById('skip-to-main');
        if (skipLink) skipLink.focus();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     5. REVEAL ANIMATIONS
     Respects prefers-reduced-motion
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  (function initReveal() {
    // Skip animations if user prefers reduced motion
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('in-view');
      });
      return;
    }
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('in-view');
      });
      return;
    }
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el  = entry.target;
        var par = el.parentElement;
        var siblings = par ? Array.from(par.querySelectorAll('.reveal:not(.in-view)')) : [];
        var delay = Math.max(0, siblings.indexOf(el)) * 90;
        setTimeout(function() {
          el.classList.add('in-view');
          el.dataset.revealed = 'true';
        }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el) {
      io.observe(el);
    });
  })();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     6. DISC-PANEL CLICK (homepage)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  document.querySelectorAll('.disc-panel[data-href]').forEach(function(el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function() {
      window.location.href = el.dataset.href;
    });
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = el.dataset.href;
      }
    });
  });

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     7. MIGRAINE MODE TOGGLE (ADA)
     - aria-pressed tracks state
     - Persists to localStorage
     - Respects prefers-color-scheme
     - Keyboard shortcut: Alt+D
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  (function initMigraineMode() {
    var STORAGE_KEY = 'monti-dark-mode';
    var BODY_CLASS  = 'dark-theme';
    var btn   = document.getElementById('dark-mode-toggle');
    var toast = document.getElementById('dark-toast');
    var timer;

    if (!btn) return;

    function showToast(title, body) {
      if (!toast) return;
      var t = document.getElementById('dark-toast__title');
      var b = document.getElementById('dark-toast__body');
      if (t) t.textContent = title;
      if (b) b.textContent = body;
      toast.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(function() {
        toast.classList.remove('is-visible');
      }, 3200);
    }

    function activate(notify) {
      document.body.classList.add(BODY_CLASS);
      document.documentElement.classList.add(BODY_CLASS);
      btn.setAttribute('aria-pressed', 'true');
      try { localStorage.setItem(STORAGE_KEY, 'on'); } catch(e) {}
      if (notify) showToast('Migraine Mode On', 'Low-glare display active. Optimized for light-sensitive viewing.');
    }

    function deactivate(notify) {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.classList.remove(BODY_CLASS);
      btn.setAttribute('aria-pressed', 'false');
      try { localStorage.setItem(STORAGE_KEY, 'off'); } catch(e) {}
      if (notify) showToast('Migraine Mode Off', 'Standard display restored.');
    }

    // Restore saved preference
    try {
      var saved   = localStorage.getItem(STORAGE_KEY);
      var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'on' || (sysDark && saved !== 'off')) activate(false);
    } catch(e) {}

    btn.addEventListener('click', function() {
      if (document.body.classList.contains(BODY_CLASS)) {
        deactivate(true);
      } else {
        activate(true);
      }
    });

    // Keyboard shortcut Alt+D
    document.addEventListener('keydown', function(e) {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        btn.click();
      }
    });

    // System theme change
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(mqe) {
        try {
          if (localStorage.getItem(STORAGE_KEY) === null) {
            if (mqe.matches) activate(false);
            else deactivate(false);
          }
        } catch(err) {}
      });
    } catch(e) {}
  })();

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     8. CONTACT FORM VALIDATION (ADA)
     - aria-describedby links errors to fields
     - aria-invalid on invalid fields
     - Focus moves to first error on submit
     - Live region announces errors
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  (function initContactForm() {
    var form    = document.getElementById('cf-form');
    var success = document.getElementById('cf-success');
    if (!form) return;

    var RULES = [
      { id: 'cf-firstname', errId: 'err-cf-firstname',
        test: function(v) { return v.trim().length > 0; },
        msg: 'First name is required.' },
      { id: 'cf-lastname', errId: 'err-cf-lastname',
        test: function(v) { return v.trim().length > 0; },
        msg: 'Last name is required.' },
      { id: 'cf-email', errId: 'err-cf-email',
        test: function(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
        msg: 'A valid email address is required.' },
      { id: 'cf-message', errId: 'err-cf-message',
        test: function(v) { return v.trim().length >= 10; },
        msg: 'Please include a message (at least 10 characters).' },
    ];

    // Link error messages to fields via aria-describedby
    RULES.forEach(function(rule) {
      var field = document.getElementById(rule.id);
      var errEl = document.getElementById(rule.errId);
      if (field && errEl) {
        field.setAttribute('aria-describedby', rule.errId);
      }
    });

    function clearErrors() {
      form.querySelectorAll('.has-error').forEach(function(el) {
        el.classList.remove('has-error');
        el.removeAttribute('aria-invalid');
      });
      form.querySelectorAll('.form-error-msg.visible').forEach(function(el) {
        el.classList.remove('visible');
      });
    }

    function validateField(rule) {
      var field = document.getElementById(rule.id);
      var errEl = document.getElementById(rule.errId);
      if (!field) return true;
      var ok = rule.test(field.value);
      if (!ok) {
        field.classList.add('has-error');
        field.setAttribute('aria-invalid', 'true');
        if (errEl) { errEl.textContent = rule.msg; errEl.classList.add('visible'); }
      }
      return ok;
    }

    function validateConsent() {
      var cb  = document.getElementById('cf-consent');
      var err = document.getElementById('err-cf-consent');
      var ok  = cb && cb.checked;
      if (!ok) {
        if (cb) { cb.classList.add('has-error'); cb.setAttribute('aria-invalid', 'true'); }
        if (err) err.classList.add('visible');
      }
      return ok;
    }

    // Clear errors on input
    form.addEventListener('input', function(e) {
      var t   = e.target;
      var err = document.getElementById('err-' + t.id);
      t.classList.remove('has-error');
      t.removeAttribute('aria-invalid');
      if (err) err.classList.remove('visible');
    });
    form.addEventListener('change', function(e) {
      var t   = e.target;
      var err = document.getElementById('err-' + t.id);
      t.classList.remove('has-error');
      t.removeAttribute('aria-invalid');
      if (err) err.classList.remove('visible');
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors();

      var fieldResults  = RULES.map(validateField);
      var consentResult = validateConsent();
      var allValid      = fieldResults.every(Boolean) && consentResult;

      if (!allValid) {
        // Move focus to first error field
        var firstErr = form.querySelector('[aria-invalid="true"]');
        if (firstErr) firstErr.focus();
        return;
      }

      var submitBtn = document.getElementById('cf-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending\u2026'; }

      setTimeout(function() {
        form.style.display = 'none';
        if (success) {
          success.classList.add('visible');
          // Move focus to success message for screen readers
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      }, 600);
    });
  })();

});
