/*
  Small page helpers (no GSAP, used on every page):
  - email links get a "what to include" checklist in the message body
  - the email popup in Contact opens on the first tap on touch screens
  - content below the hero fades up as it scrolls into view
  - in-page links scroll smoothly; the footer year stays current
*/
(() => {
  'use strict';

  const BODY = [
    'Exact location:',
    'Unit number:',
    'Issue description:',
    "Driver's information (optional):",
    'Trailer loaded or empty:',
  ].join('\r\n') + '\r\n';

  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.includes('body=')) return;
    a.setAttribute('href', href + (href.includes('?') ? '&' : '?') + 'body=' + encodeURIComponent(BODY));
  });

  // Email popup: hover/focus is handled in CSS. Touch: first tap shows it, second tap opens mail. Escape hides it.
  const tip = document.querySelector('.mail-tip-wrap');
  if (tip) {
    const link = tip.querySelector('a');
    const noHover = window.matchMedia('(hover: none)');
    link.addEventListener('click', (e) => {
      if (!noHover.matches || tip.classList.contains('is-open')) return;
      e.preventDefault();
      tip.classList.add('is-open');
    });
    document.addEventListener('click', (e) => { if (!tip.contains(e.target)) tip.classList.remove('is-open'); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { tip.classList.remove('is-open'); tip.classList.add('is-closed'); }
    });
    ['mouseleave', 'focusout'].forEach((ev) => tip.addEventListener(ev, () => tip.classList.remove('is-closed')));
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Fade-up reveals for everything below the hero. Siblings stagger; the classes come off once shown
  // so hover transitions (cards, buttons) go back to normal.
  const REVEAL = [
    '.fast-band h2', '.fast-points li',
    '.pm .eyebrow', '.pm h2', '.pm-lede', '.pm-actions', '.pm-list li',
    '.services .eyebrow', '.services h2', '.card', '.services-more',
    '.contact .eyebrow', '.contact h2', '.contact-lede', '.contact-head .badge-aside', '.contact-mail', '.contact-phone', '.cta-actions', '.facts > div',
    '.foot',
  ].join(', ');
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const items = Array.from(document.querySelectorAll(REVEAL));
    items.forEach((el) => {
      const siblings = items.filter((o) => o.parentElement === el.parentElement);
      el.style.setProperty('--i', Math.min(siblings.indexOf(el), 4));
      el.classList.add('reveal');
    });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      el.classList.add('is-in');
      setTimeout(() => { el.classList.remove('reveal', 'is-in'); el.style.removeProperty('--i'); }, 1200);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    items.forEach((el) => io.observe(el));
    document.documentElement.classList.add('reveal-on');
  }

  // Smooth in-page scrolling (in JS, not CSS scroll-behavior, so ScrollTrigger refreshes don't animate).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || reduce.matches || a.getAttribute('href').length < 2) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', a.getAttribute('href'));
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
