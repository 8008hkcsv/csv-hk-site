/* ページ上部へ戻るボタン（全ページ共通・控えめ表示）
   一定量スクロールで出現。prefers-reduced-motion時は即時スクロール
   （style.css側で html{scroll-behavior:auto} になるため behavior:'auto' で即時になる） */
(function () {
  'use strict';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bt-top';
  btn.setAttribute('aria-label', 'ページ上部へ戻る');
  btn.textContent = '↑';
  document.body.appendChild(btn);

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  function toggle() { btn.classList.toggle('show', window.scrollY > 600); }
  addEventListener('scroll', toggle, { passive: true });
  toggle();
})();
