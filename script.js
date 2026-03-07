/* =============================================
   script.js
   ============================================= */

/* — Menu hamburger — */
const menuToggle = document.getElementById('menuToggle');
const mainNav    = document.getElementById('mainNav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.dataset.open === 'true';
    mainNav.dataset.open       = isOpen ? 'false' : 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

/* — Apparition des cartes parcours — */
const cards = document.querySelectorAll('.etudes');

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

cards.forEach(card => cardObserver.observe(card));

/* — Carte "À propos" : défilement des paragraphes — */
const items        = document.querySelectorAll('.text-item');
const progressFill = document.getElementById('progressFill');
const counter      = document.getElementById('counter');
const stage        = document.getElementById('stage');
const total        = items.length;
let current        = 0;
let canScroll      = true;
const COOLDOWN     = 700;

function goTo(index) {
  if (index < 0 || index >= total) return;
  items[current].classList.remove('active');
  current = index;
  items[current].classList.add('active');

  const pct = Math.round(((current + 1) / total) * 100);
  progressFill.style.width = pct + '%';

  const num = String(current + 1).padStart(2, '0');
  counter.textContent = current === total - 1
    ? `${num} / 0${total} ✓`
    : `${num} / 0${total}`;
}

function throttled(dir) {
  if (!canScroll) return;
  canScroll = false;
  goTo(current + dir);
  setTimeout(() => { canScroll = true; }, COOLDOWN);
}

/* Molette — uniquement quand la souris est sur la carte */
stage.addEventListener('wheel', (e) => {
  e.preventDefault();
  throttled(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

/* Touch */
let ty = 0;
stage.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
stage.addEventListener('touchend',   (e) => {
  const d = ty - e.changedTouches[0].clientY;
  if (Math.abs(d) > 30) throttled(d > 0 ? 1 : -1);
}, { passive: true });

/* Clavier */
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown'  || e.key === 'ArrowRight') throttled(1);
  if (e.key === 'ArrowUp'    || e.key === 'ArrowLeft')  throttled(-1);
});

goTo(0);