/* CSV CONSULTING LIMITED — AI相談窓口チャットウィジェット
   応答はn8n Webhook経由。ブラウザ側では会話を保存しない */
(function () {
  'use strict';

  var ENDPOINT = 'https://lpkdewata.app.n8n.cloud/webhook/csv-chat';
  var GREETING = 'こんにちは。AI相談botです。香港ビザ・法人設立・銀行口座開設など、サービスについてお気軽にご質問ください。';
  var ERR_MSG = 'ただいま応答できません。公式LINEまたはWhatsAppにてご相談ください。';
  var MAX_INPUT = 1000;   // 1回の入力上限
  var MAX_HISTORY = 10;   // 送信する直近の会話数

  var history = [];
  var busy = false;

  /* ---- DOM構築 ---- */
  var root = document.createElement('div');
  root.innerHTML =
    '<div class="cw-panel" role="dialog" aria-label="AI相談bot" aria-hidden="true">' +
      '<div class="cw-head">' +
        '<span><b>AI相談bot</b></span>' +
        '<button type="button" class="cw-x" aria-label="チャットを閉じる">✕</button>' +
      '</div>' +
      '<div class="cw-log" aria-live="polite"></div>' +
      '<form class="cw-form">' +
        '<textarea rows="2" maxlength="' + MAX_INPUT + '" placeholder="ご質問を入力してください" aria-label="ご質問"></textarea>' +
        '<button type="submit" class="cw-send">送信</button>' +
      '</form>' +
      '<div class="cw-note">自動応答です。個別のご相談はスタッフにおつなぎします。</div>' +
    '</div>' +
    '<button type="button" class="cw-btn" aria-label="AI相談botを開く" aria-expanded="false">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"/></svg>' +
    '</button>';
  document.body.appendChild(root);

  var panel = root.querySelector('.cw-panel');
  var btn = root.querySelector('.cw-btn');
  var closeBtn = root.querySelector('.cw-x');
  var log = root.querySelector('.cw-log');
  var form = root.querySelector('.cw-form');
  var input = form.querySelector('textarea');

  /* 入力に応じて最大4行程度まで自動で伸ばす（それ以上は内部スクロール） */
  var MAX_TA_H = 118;
  function autosize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, MAX_TA_H) + 'px';
    input.style.overflowY = input.scrollHeight > MAX_TA_H ? 'auto' : 'hidden';
  }
  input.addEventListener('input', autosize);
  var send = form.querySelector('.cw-send');
  var greeted = false;

  /* ---- 開閉 ---- */
  function setOpen(open) {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'AI相談botを閉じる' : 'AI相談botを開く');
    if (open) {
      if (!greeted) { greeted = true; addMsg('bot', GREETING); }
      input.focus();
    }
  }
  btn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
  });

  /* ---- メッセージ表示 ---- */
  function addMsg(kind, text) {
    var el = document.createElement('div');
    el.className = 'cw-m ' + (kind === 'user' ? 'cw-user' : 'cw-bot');
    if (kind === 'user') { el.textContent = text; }
    else { renderBot(el, text); }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  /* AIの返答に含まれるMarkdown記法を除去し、URLはリンク化して表示
     （innerHTMLは使わずテキストノード＋a要素で組み立てる） */
  function renderBot(el, text) {
    el.textContent = '';
    var t = String(text)
      .replace(/^\s*[-*_]{3,}\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, url) {
        return label === url ? url : label + ' ' + url;
      });
    t.split(/(https?:\/\/[^\s）)]+)/g).forEach(function (part) {
      if (/^https?:\/\//.test(part)) {
        var a = document.createElement('a');
        a.href = part; a.textContent = part;
        a.target = '_blank'; a.rel = 'noopener';
        el.appendChild(a);
      } else if (part) {
        el.appendChild(document.createTextNode(part));
      }
    });
  }

  /* ---- 送信 ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    autosize();
    addMsg('user', text);

    // history は今回の質問を含まない直近の会話（質問本文は message で送る）
    var payload = { message: text, history: history.slice(-MAX_HISTORY) };
    history.push({ role: 'user', content: text });

    busy = true;
    send.disabled = true;
    var wait = addMsg('bot', '…');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('http ' + res.status);
      return res.json();
    }).then(function (data) {
      var reply = (data && typeof data.reply === 'string' && data.reply) ? data.reply : ERR_MSG;
      renderBot(wait, reply);
      history.push({ role: 'assistant', content: reply });
      log.scrollTop = log.scrollHeight;
    }).catch(function () {
      wait.textContent = ERR_MSG;
    }).then(function () {
      busy = false;
      send.disabled = false;
    });
  });
})();
