/**
 * UNIMOST — i18n language switcher + shared JS
 * Switches between Turkish (default) and English without page reload.
 * Uses data-tr / data-en attributes for inline text,
 * and .tr-content / .en-content classes for block content.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'unimost-lang';
  const DEFAULT_LANG = 'tr';

  /* ── Core: apply language ──────────────────────────────── */
  function applyLang(lang) {
    const other = lang === 'tr' ? 'en' : 'tr';

    /* 1. Swap inline text via data-tr / data-en */
    document.querySelectorAll('[data-tr]').forEach(function (el) {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });

    /* 2. Swap HTML content via data-tr-html / data-en-html */
    document.querySelectorAll('[data-tr-html]').forEach(function (el) {
      const val = el.getAttribute('data-' + lang + '-html');
      if (val !== null) el.innerHTML = val;
    });

    /* 3. Swap placeholder attributes */
    document.querySelectorAll('[data-ph-tr]').forEach(function (el) {
      const val = el.getAttribute('data-ph-' + lang);
      if (val !== null) el.setAttribute('placeholder', val);
    });

    /* 4. Swap title attributes */
    document.querySelectorAll('[data-title-tr]').forEach(function (el) {
      const val = el.getAttribute('data-title-' + lang);
      if (val !== null) el.setAttribute('title', val);
    });

    /* 5. Toggle block content */
    document.querySelectorAll('.tr-content, .en-content').forEach(function (el) {
      el.style.display = el.classList.contains(lang + '-content') ? '' : 'none';
    });

    /* 6. Update <html lang=""> */
    document.documentElement.setAttribute('lang', lang);

    /* 7. Highlight active lang button(s) */
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    /* 8. Update <title> if provided */
    const titleEl = document.querySelector('title[data-tr]');
    if (titleEl) {
      const t = titleEl.getAttribute('data-' + lang);
      if (t) titleEl.textContent = t;
    }

    /* 9. Persist */
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  /* ── Get stored / default lang ─────────────────────────── */
  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  /* ── Sticky nav + scroll class ──────────────────────────── */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile hamburger ────────────────────────────────────── */
  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var menu   = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    /* Close on nav link click (mobile) */
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Active nav link ─────────────────────────────────────── */
  function initActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[href]').forEach(function (link) {
      var href = link.getAttribute('href').split('#')[0];
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── Intersection Observer (fade-in) ────────────────────── */
  function initFadeIn() {
    if (!('IntersectionObserver' in window)) {
      /* Fallback: show all */
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Project gallery (detail pages) ─────────────────────── */
  function initProjectGallery() {
    var gallery = document.querySelector('.project-hero-gallery');
    if (!gallery) return;
    var imgs    = gallery.querySelectorAll('img');
    if (imgs.length < 2) {
      if (imgs.length === 1) imgs[0].classList.add('active');
      return;
    }
    var current = 0;
    imgs[0].classList.add('active');

    function goTo(idx) {
      imgs[current].classList.remove('active');
      current = (idx + imgs.length) % imgs.length;
      imgs[current].classList.add('active');
    }

    var prev = gallery.querySelector('.gallery-prev');
    var next = gallery.querySelector('.gallery-next');
    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });

    /* Auto-advance */
    setInterval(function () { goTo(current + 1); }, 5000);
  }

  /* ── Contact form (preventDefault + success msg) ─────────── */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = document.getElementById('form-success');
      if (success) success.classList.add('show');
      form.reset();
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var lang = getStoredLang();

    /* Wire lang buttons */
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.dataset.lang);
      });
    });

    /* Apply stored language (runs after buttons wired) */
    applyLang(lang);

    initNav();
    initMobileMenu();
    initActiveNav();
    initFadeIn();
    initProjectGallery();
    initContactForm();
  });

})();
