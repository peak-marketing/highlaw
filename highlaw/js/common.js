/* ============================================================
   HIGHLAW — common.js  (서브 페이지 공통)
============================================================ */

/* ── Mobile nav ──────────────────────────────── */
const btnNav      = document.getElementById('btnNavMobile');
const mobileNav   = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileNavClose');

if (btnNav) {
  btnNav.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}
if (mobileClose) {
  mobileClose.addEventListener('click', closeMobileNav);
}
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
}
function closeMobileNav() {
  mobileNav && mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Scroll reveal ───────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    /* Stagger siblings */
    const siblings = entry.target.parentElement.querySelectorAll('.reveal');
    let delay = 0;
    siblings.forEach((el, idx) => { if (el === entry.target) delay = idx * 100; });
    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Contact form ────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const areaSelect  = document.getElementById('area');

if (areaSelect) {
  areaSelect.addEventListener('change', () => {
    areaSelect.classList.toggle('filled', areaSelect.value !== '');
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const orig = btn.textContent;
    btn.textContent = '전송 중...';
    btn.disabled = true;

    /* ── TODO: 실제 서버/Formspree 연동 ──
       fetch('https://formspree.io/f/YOUR_ID', {
         method: 'POST',
         body: new FormData(contactForm),
         headers: { 'Accept': 'application/json' }
       });
    ────────────────────────────────────── */

    setTimeout(() => {
      alert('상담 신청이 완료되었습니다.\n빠른 시일 내에 연락드리겠습니다.');
      contactForm.reset();
      areaSelect && areaSelect.classList.remove('filled');
      btn.textContent = orig;
      btn.disabled = false;
    }, 700);
  });
}
