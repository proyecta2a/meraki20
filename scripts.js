/* ════════════════════════════════════════════
   MERAKI 20 — scripts.js  v4
════════════════════════════════════════════ */

/* ── Mobile nav toggle ── */
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

/* ── Scroll reveal para tipo-card ── */
const rows = document.querySelectorAll('.tipo-card');
const revealObs = new IntersectionObserver(
  entries => entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${i * 0.08}s`;
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  }),
  { threshold: 0.10 }
);
rows.forEach(r => revealObs.observe(r));

/* ── Navbar al hacer scroll ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 80
    ? 'rgba(20,24,32,0.99)'
    : 'rgba(20,24,32,0.96)';
}, { passive: true });

/* ════════════════════════════════════════════
   LIGHTBOX con zoom, arrastre y rueda
════════════════════════════════════════════ */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lb-img');
const lbWrap    = document.getElementById('lb-img-wrap');
const lbClose   = document.getElementById('lb-close');
const lbZoomIn  = document.getElementById('lb-zoom-in');
const lbZoomOut = document.getElementById('lb-zoom-out');
const lbReset   = document.getElementById('lb-reset');
const lbLabel   = document.getElementById('lb-zoom-label');

let scale   = 1;
let tx = 0, ty = 0;
let dragging = false;
let dragStartX, dragStartY, txStart, tyStart;

const STEP    = 0.35;
const MIN     = 0.5;
const MAX     = 5;
const PADDING = 40;

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function applyTransform(animated = false) {
  lbImg.style.transition = animated ? 'transform 0.25s ease' : 'none';
  lbImg.style.transform  = `translate(${tx}px, ${ty}px) scale(${scale})`;
  lbLabel.textContent    = Math.round(scale * 100) + '%';
}

function clampTranslate() {
  if (scale <= 1) { tx = 0; ty = 0; return; }
  const rect  = lbImg.getBoundingClientRect();
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  const maxTx = Math.max(0, (rect.width  - ww) / 2 + PADDING);
  const maxTy = Math.max(0, (rect.height - wh) / 2 + PADDING);
  tx = clamp(tx, -maxTx, maxTx);
  ty = clamp(ty, -maxTy, maxTy);
}

function resetLb() {
  scale = 1; tx = 0; ty = 0;
  applyTransform(true);
}

function zoomBy(delta) {
  scale = clamp(scale + delta, MIN, MAX);
  clampTranslate();
  applyTransform(true);
}

/* Abrir lightbox al hacer clic en cualquier elemento con data-lb */
document.querySelectorAll('[data-lb]').forEach(el => {
  const img = el.querySelector('img');
  if (!img) return;
  el.style.cursor = 'zoom-in';
  el.addEventListener('click', e => {
    e.stopPropagation();
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    resetLb();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

/* Cerrar lightbox */
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lbImg.src = '';
}
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

/* Teclado */
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')                     closeLightbox();
  if (e.key === '+' || e.key === '=')         zoomBy(+STEP);
  if (e.key === '-')                           zoomBy(-STEP);
  if (e.key === '0')                           resetLb();
});

/* Botones zoom */
lbZoomIn .addEventListener('click', e => { e.stopPropagation(); zoomBy(+STEP); });
lbZoomOut.addEventListener('click', e => { e.stopPropagation(); zoomBy(-STEP); });
lbReset  .addEventListener('click', e => { e.stopPropagation(); resetLb(); });

/* Rueda del ratón */
lbWrap.addEventListener('wheel', e => {
  e.preventDefault();
  zoomBy(e.deltaY < 0 ? +STEP * 0.6 : -STEP * 0.6);
}, { passive: false });

/* Arrastre con mouse */
lbWrap.addEventListener('mousedown', e => {
  if (scale <= 1) return;
  e.preventDefault();
  dragging = true;
  dragStartX = e.clientX; dragStartY = e.clientY;
  txStart = tx; tyStart = ty;
  lbWrap.classList.add('grabbing');
});
window.addEventListener('mousemove', e => {
  if (!dragging) return;
  tx = txStart + (e.clientX - dragStartX);
  ty = tyStart + (e.clientY - dragStartY);
  clampTranslate();
  applyTransform();
});
window.addEventListener('mouseup', () => {
  dragging = false;
  lbWrap.classList.remove('grabbing');
});

/* Touch: arrastre y pinch-to-zoom */
let lastDist = 0;
lbWrap.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    lastDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  } else if (e.touches.length === 1 && scale > 1) {
    dragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    txStart = tx; tyStart = ty;
  }
}, { passive: true });

lbWrap.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    scale = clamp(scale + (dist - lastDist) / 180, MIN, MAX);
    lastDist = dist;
    clampTranslate();
    applyTransform();
  } else if (e.touches.length === 1 && dragging) {
    tx = txStart + (e.touches[0].clientX - dragStartX);
    ty = tyStart + (e.touches[0].clientY - dragStartY);
    clampTranslate();
    applyTransform();
  }
}, { passive: false });

lbWrap.addEventListener('touchend', () => { dragging = false; });

/* Doble clic / doble tap: alterna entre 1× y 2× */
lbWrap.addEventListener('dblclick', e => {
  e.stopPropagation();
  if (scale > 1) resetLb();
  else { scale = 2; clampTranslate(); applyTransform(true); }
});
