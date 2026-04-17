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

const TOTAL   = sections.length;
let current   = 0;
let animating = false;

/* ── 슬라이드 이동 ── */
function goTo(idx) {
  if (idx < 0 || idx >= TOTAL) return;
  if (animating) return;
  animating = true;
  current   = idx;

  slideWrap.style.transition = `transform ${DURATION}ms ${EASE}`;
  slideWrap.style.transform  = `translateY(${-idx * 100}vh)`;

  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  header.classList.toggle('scrolled', idx > 0);

  setTimeout(() => { animating = false; }, DURATION + 60);
}

/* ── 초기 위치 세팅 ── */
slideWrap.style.transition = 'none';
slideWrap.style.transform  = 'translateY(0)';

/* ── 마우스 휠 ── */
let wheelBlock = false;
window.addEventListener('wheel', (e) => {
  if (isMob()) return;
  e.preventDefault();
  if (wheelBlock) return;
  wheelBlock = true;
  setTimeout(() => { wheelBlock = false; }, DURATION + 120);
  e.deltaY > 0 ? goTo(current + 1) : goTo(current - 1);
}, { passive: false });

/* ── 터치 스와이프 ── */
let ty = 0;
window.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', e => {
  if (isMob()) return;
  const d = ty - e.changedTouches[0].clientY;
  if (Math.abs(d) < 50) return;
  d > 0 ? goTo(current + 1) : goTo(current - 1);
}, { passive: true });

/* ── 키보드 ── */
document.addEventListener('keydown', e => {
  if (isMob()) return;
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
  if (isMob()) {
    document.body.classList.add('mobile-scroll');
    slideWrap.style.transition = 'none';
    slideWrap.style.transform  = 'none';
  } else {
    document.body.classList.remove('mobile-scroll');
    slideWrap.style.transition = 'none';
    slideWrap.style.transform  = `translateY(${-current * 100}vh)`;
  }
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

/* ── 모바일: 현재 섹션 추적 (IntersectionObserver) ── */
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    if (!isMob()) return;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = [...sections].indexOf(entry.target);
      if (idx < 0) return;
      current = idx;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      header.classList.toggle('scrolled', idx > 0);
    });
  }, { threshold: 0.5 });
  sections.forEach(s => obs.observe(s));
}
