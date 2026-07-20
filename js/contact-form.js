/* お問い合わせフォーム → n8n Webhook（POST/JSON）
   成功 {ok:true} でフォームを完了メッセージに置換。ログはブラウザに保存しない */
(function () {
  'use strict';
  var ENDPOINT = 'https://lpkdewata.app.n8n.cloud/webhook/csv-contact-form';

  document.querySelectorAll('.cform').forEach(function (form) {
    var btn = form.querySelector('.cform-send');
    var note = form.querySelector('.cform-note');
    var el = function (n) { return form.elements.namedItem(n); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var payload = {
        name: el('name').value.trim(),
        company: el('company').value.trim(),
        email: el('email').value.trim(),
        message: el('message').value.trim(),
        company_url: el('company_url').value.trim()
      };

      btn.disabled = true;
      var orig = btn.textContent;
      btn.textContent = '送信中...';
      note.textContent = '';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      }).then(function (d) {
        if (d && d.ok === true) {
          // 完了表示: メッセージ + 社名のみ（フォーム見出しと住所行は非表示）
          var done = document.createElement('p');
          done.className = 'cform-done';
          done.setAttribute('role', 'status');
          done.textContent = '送信しました。担当者よりご連絡いたします。';
          var wrap = form.closest('.cform-wrap');
          if (wrap) { wrap.textContent = ''; wrap.appendChild(done); }
          else { form.replaceWith(done); }
          var sec = wrap && wrap.closest('.contact');
          var addr = sec && sec.querySelector('.contact-addr');
          if (addr) { addr.textContent = 'CSV CONSULTING LIMITED'; }
        } else {
          throw new Error('bad response');
        }
      }).catch(function () {
        note.textContent = '送信できませんでした。お手数ですがLINE・WhatsApp・メールにてご連絡ください。';
        btn.disabled = false;
        btn.textContent = orig;
      });
    });
  });
})();
