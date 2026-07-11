/* Monti Institute — shared multi-page script */
(function() {
  'use strict';

  /* ── Nav: scroll border ── */
  var navEl = document.getElementById('js-nav');
  if (navEl) {
    window.addEventListener('scroll', function() {
      navEl.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ── Nav: mobile toggle ── */
  (function initMobileNav() {
    function setup() {
      var btn  = document.getElementById('js-nav-toggle');
      var list = document.getElementById('js-nav-list');
      if (!btn || !list) return;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        list.classList.toggle('is-open', !isOpen);
      });
      document.addEventListener('click', function(e) {
        if (!list.classList.contains('is-open')) return;
        var nav = document.getElementById('js-nav');
        if (nav && !nav.contains(e.target)) {
          btn.setAttribute('aria-expanded', 'false');
          list.classList.remove('is-open');
        }
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && list.classList.contains('is-open')) {
          btn.setAttribute('aria-expanded', 'false');
          list.classList.remove('is-open');
          btn.focus();
        }
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else { setup(); }
  })();

  /* ── Scroll progress bar ── */
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
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
// Dropdown nav
document.querySelectorAll('.nav__item--dropdown').forEach(item => {
  const toggle = item.querySelector('.nav__dropdown-toggle');
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = item.hasAttribute('data-open');
    document.querySelectorAll('.nav__item--dropdown[data-open]').forEach(el => el.removeAttribute('data-open'));
    if (!isOpen) item.setAttribute('data-open', '');
    toggle.setAttribute('aria-expanded', !isOpen);
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav__item--dropdown[data-open]').forEach(el => {
    el.removeAttribute('data-open');
    el.querySelector('.nav__dropdown-toggle').setAttribute('aria-expanded', 'false');
  });
});
  /* ── Reveal animations (IntersectionObserver) ── */
  (function initReveal() {
    if (!window.IntersectionObserver) return;
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

  /* ── Disc-panel click (homepage only) ── */
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

  /* ── Nav: JS click routing (replaces default href follow) ──
     Prevents "external link" browser warnings in some environments
     by handling page navigation explicitly through window.location.
     href attributes are kept intact for SEO and accessibility.     */
  (function initNavClick() {
    function setup() {
      var list = document.getElementById('js-nav-list');
      var btn  = document.getElementById('js-nav-toggle');

      /* Collect all navigable anchors: nav links + brand logo link */
      var links = document.querySelectorAll(
        '#js-nav .nav__link, #js-nav .nav__brand'
      );

      links.forEach(function(link) {
        link.addEventListener('click', function(e) {
          var href = link.getAttribute('href');

          /* External-link bypass — explicit flags take priority and
             are checked first regardless of href format. Covers
             gift-card / merchant-portal links and any link marked
             external, even if its href is a relative or unusual path. */
          if (link.hasAttribute('data-nav') && link.getAttribute('data-nav') === 'external') return;
          if (link.classList.contains('external-link')) return;
          if (link.getAttribute('target') === '_blank') return;

          /* Leave external, mailto, tel, and hash-only links alone */
          if (!href
            || href === '#'
            || href.indexOf('://') !== -1
            || href.indexOf('mailto:') === 0
            || href.indexOf('tel:') === 0) {
            return;
          }

          /* Stop the default anchor follow */
          e.preventDefault();

          /* Close mobile menu if open */
          if (list && list.classList.contains('is-open')) {
            list.classList.remove('is-open');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }

          /* Navigate via JavaScript */
          window.location.href = href;
        });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  })();

  /* ── Migraine Mode toggle ────────────────────────────────────────
     Toggles body.dark-theme. Persists to localStorage.
     Safe: exits gracefully if button is absent on any page.
  ─────────────────────────────────────────────────────────────── */
  (function initMigraineMode() {
    var STORAGE_KEY = 'monti-dark-mode';
    var BODY_CLASS  = 'dark-theme';

    function setup() {
      var btn   = document.getElementById('dark-mode-toggle');
      var toast = document.getElementById('dark-toast');
      var timer;

      if (!btn) return; /* button absent on this page — safe exit */

      /* ── Toast notification ── */
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

      /* ── Activate / deactivate ── */
      function activate(notify) {
        document.body.classList.add(BODY_CLASS);
        document.documentElement.classList.add(BODY_CLASS); /* <html> too — fixes light edge in dark mode */
        btn.setAttribute('aria-pressed', 'true');
        try { localStorage.setItem(STORAGE_KEY, 'on'); } catch(e){}
        if (notify) showToast(
          'Migraine Mode — On',
          'Low-glare display active. Optimized for light-sensitive viewing.'
        );
      }

      function deactivate(notify) {
        document.body.classList.remove(BODY_CLASS);
        document.documentElement.classList.remove(BODY_CLASS);
        btn.setAttribute('aria-pressed', 'false');
        try { localStorage.setItem(STORAGE_KEY, 'off'); } catch(e){}
        if (notify) showToast('Migraine Mode — Off', 'Standard display restored.');
      }

      /* ── Restore saved preference on page load ── */
      try {
        var saved       = localStorage.getItem(STORAGE_KEY);
        var sysDark     = window.matchMedia &&
                          window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'on' || (sysDark && saved !== 'off')) {
          activate(false);
        }
      } catch(e) {}

      /* ── Click handler ── */
      btn.addEventListener('click', function() {
        if (document.body.classList.contains(BODY_CLASS)) {
          deactivate(true);
        } else {
          activate(true);
        }
      });

      /* ── Keyboard shortcut: Alt + D ── */
      document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'd' || e.key === 'D')) {
          e.preventDefault();
          btn.click();
        }
      });

      /* ── System theme change ── */
      try {
        window.matchMedia('(prefers-color-scheme: dark)')
              .addEventListener('change', function(mqe) {
          try {
            if (localStorage.getItem(STORAGE_KEY) === null) {
              if (mqe.matches) { activate(false); }
              else             { deactivate(false); }
            }
          } catch(err) {}
        });
      } catch(e) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  })();

})();
