/* ============================================================
   HIGHLAW — main.js
   body overflow:hidden + transform translateY 슬라이딩
============================================================ */

const DURATION = 950;   // 전환 시간 (ms)
const EASE     = 'cubic-bezier(0.77, 0, 0.175, 1)';

/* ── Elements ── */
const slideWrap   = document.getElementById('slideWrap');
const header      = document.getElementById('siteHeader');
const btnNav      = document.getElementById('btnNavMobile');
const mobileNav   = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileNavClose');
const dots        = document.querySelectorAll('.section-dots li a');
const sections    = document.querySelectorAll('#slideWrap .ms');
const scrollBtn   = document.getElementById('scrollDown');
const root        = document.documentElement;

const TOTAL   = sections.length;
let current   = 0;
let animating = false;
let viewportHeight = window.innerHeight;
let touchLocked = false;
let touchIsVertical = false;

function isMenuOpen() {
  return mobileNav && mobileNav.classList.contains('open');
}

function setViewportUnit() {
  viewportHeight = window.innerHeight;
  root.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
}

function setSlidePosition(animated = false) {
  slideWrap.style.transition = animated ? `transform ${DURATION}ms ${EASE}` : 'none';
  slideWrap.style.transform  = `translateY(${-current * viewportHeight}px)`;
}

/* ── 슬라이드 이동 ── */
function goTo(idx) {
  if (idx < 0 || idx >= TOTAL) return;
  if (animating) return;
  animating = true;
  current   = idx;

  window.scrollTo(0, 0);
  setSlidePosition(true);

  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  header.classList.toggle('scrolled', idx > 0);

  setTimeout(() => { animating = false; }, DURATION + 60);
}

/* ── 초기 위치 세팅 ── */
setViewportUnit();
setSlidePosition();

/* ── 마우스 휠 ── */
let wheelBlock = false;
window.addEventListener('wheel', (e) => {
  if (isMob() || isMenuOpen()) return;
  e.preventDefault();
  if (wheelBlock) return;
  wheelBlock = true;
  setTimeout(() => { wheelBlock = false; }, DURATION + 120);
  e.deltaY > 0 ? goTo(current + 1) : goTo(current - 1);
}, { passive: false });

/* ── 터치 스와이프 ── */
let ty = 0;
let tx = 0;
document.addEventListener('touchstart', e => {
  if (isMenuOpen()) return;
  ty = e.touches[0].clientY;
  tx = e.touches[0].clientX;
  touchLocked = false;
  touchIsVertical = false;
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (isMenuOpen()) return;
  const dy = ty - e.touches[0].clientY;
  const dx = tx - e.touches[0].clientX;

  if (!touchLocked) {
    if (Math.abs(dy) < 8 && Math.abs(dx) < 8) return;
    touchLocked = true;
    touchIsVertical = Math.abs(dy) > Math.abs(dx);
  }

  if (touchIsVertical) e.preventDefault();
}, { passive: false });
document.addEventListener('touchend', e => {
  if (isMenuOpen()) return;
  const d = ty - e.changedTouches[0].clientY;
  const dx = tx - e.changedTouches[0].clientX;
  if (Math.abs(d) < 55 || Math.abs(d) <= Math.abs(dx)) return;
  d > 0 ? goTo(current + 1) : goTo(current - 1);
}, { passive: true });
document.addEventListener('touchcancel', () => {
  touchLocked = false;
  touchIsVertical = false;
}, { passive: true });

/* ── 키보드 ── */
document.addEventListener('keydown', e => {
  if (isMob() || isMenuOpen()) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
});

/* ── 점 네비 ── */
dots.forEach((d, i) => {
  d.addEventListener('click', e => { e.preventDefault(); goTo(i); });
});

/* ── Scroll Down 버튼 ── */
if (scrollBtn) scrollBtn.addEventListener('click', () => goTo(1));

/* ── 모바일 전환 ── */
function isMob() { return window.innerWidth < 769; }

function applyMode() {
  root.classList.add('main-page-lock');
  document.body.classList.remove('mobile-scroll');
  root.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  setViewportUnit();
  setSlidePosition();
  header.classList.toggle('scrolled', current > 0);
}
applyMode();

let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(applyMode, 150);
});

/* ── 모바일 메뉴 ── */
if (btnNav)      btnNav.addEventListener('click', openMob);
if (mobileClose) mobileClose.addEventListener('click', closeMob);
if (mobileNav)   mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMob));

function openMob() {
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMob() {
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}
