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

})();
