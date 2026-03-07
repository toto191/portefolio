/* ═══════════════════════════════════════════════════════════════
   flutter-veille.js
   Gestion : date live · compteur packages · freq dots · scroll reveal
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Date live ── */
  function fvSetLiveDate() {
    const el = document.getElementById('fv-live-date');
    if (!el) return;
    const now  = new Date();
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = now.toLocaleDateString('fr-FR', opts);
  }

  /* ── 2. Compteur animé packages ── */
  function fvAnimateCounter(el, target, duration) {
    if (!el) return;
    const start     = performance.now();
    const startVal  = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current.toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function fvInitCounter() {
    const el = document.getElementById('fv-package-count');
    if (!el) return;

    // Déclencher au scroll (IntersectionObserver)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fvAnimateCounter(el, 65664, 2200);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
  }

  /* ── 3. Freq dots (indicateurs de fréquence) ── */
  function fvBuildFreqDots() {
    const MAX_DOTS   = 5;
    const containers = document.querySelectorAll('.fv-freq__dots[data-freq]');

    containers.forEach((container) => {
      const active = parseInt(container.getAttribute('data-freq'), 10) || 0;
      container.removeAttribute('data-freq'); // nettoyage
      container.innerHTML = '';

      for (let i = 0; i < MAX_DOTS; i++) {
        const dot = document.createElement('span');
        dot.classList.add('fv-freq-dot');
        if (i < active) dot.classList.add('fv-freq-dot--active');
        container.appendChild(dot);
      }
    });
  }

  /* ── 4. Scroll reveal (fade + translateY) ── */
  function fvInitScrollReveal() {
    const targets = document.querySelectorAll(
      '.fv-card, .fv-bloc, .fv-channel, .fv-platform, .fv-strength, .fv-package'
    );

    targets.forEach((el) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(22px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Délai échelonné basé sur la position dans le DOM
            const siblings = Array.from(entry.target.parentElement.children);
            const idx      = siblings.indexOf(entry.target);
            const delay    = idx * 80;

            setTimeout(() => {
              entry.target.style.opacity   = '1';
              entry.target.style.transform = 'translateY(0)';
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ── 5. Highlight actif section au scroll ── */
  function fvInitSectionHighlight() {
    const sections = document.querySelectorAll('.fv-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fv-section--active');
          } else {
            entry.target.classList.remove('fv-section--active');
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ── 6. Boutons toggle sections ── */
  function fvInitToggleButtons() {
    const buttons  = document.querySelectorAll('.fv-toggle-btn');
    const divider  = document.getElementById('fv-divider-mid');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrapId  = 'fv-wrap-' + btn.dataset.target
          .replace('fv-flutter-presentation', 'presentation')
          .replace('fv-veille-strategie',      'veille');
        const wrap    = document.getElementById(wrapId);
        if (!wrap) return;

        const isActive = btn.classList.contains('fv-toggle-btn--active');

        // Basculer l'état
        btn.classList.toggle('fv-toggle-btn--active',   !isActive);
        btn.classList.toggle('fv-toggle-btn--inactive',  isActive);
        btn.setAttribute('aria-pressed', String(!isActive));
        btn.querySelector('.fv-toggle-btn__state').textContent = isActive ? 'OFF' : 'ON';

        wrap.classList.toggle('fv-section-wrap--collapsed', isActive);

        // Gérer la visibilité du divider
        if (divider) {
          const allWraps     = document.querySelectorAll('.fv-section-wrap');
          const allCollapsed = Array.from(allWraps).every(
            (w) => w.classList.contains('fv-section-wrap--collapsed')
          );
          const anyCollapsed = Array.from(allWraps).some(
            (w) => w.classList.contains('fv-section-wrap--collapsed')
          );
          divider.classList.toggle('fv-divider--hidden', anyCollapsed);
        }
      });
    });
  }

  /* ── Init ── */
  function fvInit() {
    fvSetLiveDate();
    fvBuildFreqDots();
    fvInitCounter();
    fvInitScrollReveal();
    fvInitSectionHighlight();
    fvInitToggleButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fvInit);
  } else {
    fvInit();
  }
})();