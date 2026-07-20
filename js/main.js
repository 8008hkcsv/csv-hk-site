/* CSV CONSULTING LIMITED — サイト共通スクリプト */

// ── ヘッダー：スクロールで白背景に ──
const hd = document.getElementById('hd');
addEventListener('scroll', () => hd.classList.toggle('on', scrollY > 60), { passive: true });

// ── スマホ用メニュー開閉 ──
const menuBtn = document.getElementById('menuBtn');
const spMenu = document.getElementById('spMenu');
function closeMenu() {
  menuBtn.classList.remove('open');
  spMenu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'メニューを開く');
}
menuBtn.addEventListener('click', () => {
  const open = !spMenu.classList.contains('open');
  menuBtn.classList.toggle('open', open);
  spMenu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
});
spMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ── 静かなフェード出現 ──
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ── 数字のカウントアップ（画面に入った時に1回だけ・1.2秒） ──
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const to = +el.dataset.to;
    const dur = 1200;
    const t0 = performance.now();
    cio.unobserve(el);
    if (reduce) { el.textContent = to.toLocaleString(); return; }
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const v = Math.round(to * (1 - Math.pow(1 - p, 3))); // ゆっくり止まる
      el.textContent = v.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.cnt').forEach(el => cio.observe(el));
