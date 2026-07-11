'use strict';

document.addEventListener('DOMContentLoaded', function() {
  /*  Nav: scroll border  */
  var navEl = document.getElementById('js-nav');
  if (navEl) {
    window.addEventListener('scroll', function() {
      navEl.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /*  Nav: mobile toggle  */
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

  /*  Scroll progress bar  */
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
  /*  Nav: dropdown menus  */
  (function initDropdowns() {
    function setup() {
      /* Ensure dropdown links always navigate on click */
      document.querySelectorAll('.nav__dropdown-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
          var href = link.getAttribute('href');
          if (href && href !== '#') {
            e.stopPropagation();
            window.location.href = href;
          }
        });
      });

      document.querySelectorAll('.nav__item--dropdown').forEach(function(item) {
        var toggle = item.querySelector('.nav__dropdown-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var isOpen = item.hasAttribute('data-open');
          document.querySelectorAll('.nav__item--dropdown[data-open]').forEach(function(el) {
            el.removeAttribute('data-open');
            var t = el.querySelector('.nav__dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.setAttribute('data-open', '');
            toggle.setAttribute('aria-expanded', 'true');
          }
        });
      });
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav__item--dropdown')) {
          document.querySelectorAll('.nav__item--dropdown[data-open]').forEach(function(el) {
            el.removeAttribute('data-open');
            var t = el.querySelector('.nav__dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          });
        }
        /* Allow dropdown-link clicks to navigate — close dropdown then follow href */
        if (e.target.classList.contains('nav__dropdown-link')) {
          document.querySelectorAll('.nav__item--dropdown[data-open]').forEach(function(el) {
            el.removeAttribute('data-open');
            var t = el.querySelector('.nav__dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else { setup(); }
  })();
  /*  Reveal animations (IntersectionObserver)  */
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

  /*  Disc-panel click (homepage only)  */
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

    /*  Nav: close mobile menu on any link click  */
  (function initNavLinkClose() {
    function setup() {
      var list = document.getElementById('js-nav-list');
      var btn  = document.getElementById('js-nav-toggle');
      if (!list || !btn) return;
      list.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          if (list.classList.contains('is-open')) {
            list.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  })();

  /*  Migraine Mode toggle 
     Toggles body.dark-theme. Persists to localStorage.
     Safe: exits gracefully if button is absent on any page.
   */
  (function initMigraineMode() {
    var STORAGE_KEY = 'monti-dark-mode';
    var BODY_CLASS  = 'dark-theme';

    function setup() {
      var btn   = document.getElementById('dark-mode-toggle');
      var toast = document.getElementById('dark-toast');
      var timer;

      if (!btn) return; /* button absent on this page  safe exit */

      /*  Toast notification  */
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

      /*  Activate / deactivate  */
      function activate(notify) {
        document.body.classList.add(BODY_CLASS);
        document.documentElement.classList.add(BODY_CLASS); /* <html> too  fixes light edge in dark mode */
        btn.setAttribute('aria-pressed', 'true');
        try { localStorage.setItem(STORAGE_KEY, 'on'); } catch(e){}
        if (notify) showToast(
          'Migraine Mode  On',
          'Low-glare display active. Optimized for light-sensitive viewing.'
        );
      }

      function deactivate(notify) {
        document.body.classList.remove(BODY_CLASS);
        document.documentElement.classList.remove(BODY_CLASS);
        btn.setAttribute('aria-pressed', 'false');
        try { localStorage.setItem(STORAGE_KEY, 'off'); } catch(e){}
        if (notify) showToast('Migraine Mode  Off', 'Standard display restored.');
      }

      /*  Restore saved preference on page load  */
      try {
        var saved       = localStorage.getItem(STORAGE_KEY);
        var sysDark     = window.matchMedia &&
                          window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'on' || (sysDark && saved !== 'off')) {
          activate(false);
        }
      } catch(e) {}

      /*  Click handler  */
      btn.addEventListener('click', function() {
        if (document.body.classList.contains(BODY_CLASS)) {
          deactivate(true);
        } else {
          activate(true);
        }
      });

      /*  Keyboard shortcut: Alt + D  */
      document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'd' || e.key === 'D')) {
          e.preventDefault();
          btn.click();
        }
      });

      /*  System theme change  */
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

})();}
});
