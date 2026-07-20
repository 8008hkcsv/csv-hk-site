/* ヒーロー背景動画（トップページ・PC/スマホ共通）
   ページ読み込み完了(load)後にsrcを注入して再生を開始する。
   初期表示・LCPは従来どおりCSS背景の静止画（hero-morning.webp）が担い、
   動画は再生開始後にフェードインで重なる。
   prefers-reduced-motion・データセーバー有効時は一切読み込まない。 */
(function () {
  'use strict';
  var video = document.querySelector('.hero-video');
  if (!video) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var conn = navigator.connection;
  if (conn && conn.saveData) return;

  function tryPlay() {
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* 自動再生拒否時は静止画のまま */ });
  }

  function start() {
    video.muted = true; /* 属性に加えプロパティでも指定（自動再生許可の確実化） */
    video.addEventListener('playing', function () {
      video.classList.add('playing');
    }, { once: true });
    /* データ準備完了時にも再生を試みる（初回play()が間に合わず失敗した場合の保険） */
    video.addEventListener('canplay', tryPlay);
    video.src = 'images/hero-morning.mp4';
    tryPlay();
  }

  /* 音声なし動画はタブが背面になるとブラウザが省電力で停止するため、
     タブに戻ってきた時に再生を再開する */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && video.src) tryPlay();
  });

  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
})();
