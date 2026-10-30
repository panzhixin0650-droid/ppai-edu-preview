// 读取同目录 config.json 中的 application_url；只有合法的 HTTPS 地址才会启用“进入在线体验”。
// 本页不收集任何账号信息，登录只在应用本身完成。
(function () {
  'use strict';

  var cta = document.getElementById('cta-enter');
  var note = document.getElementById('cta-note');
  if (!cta || !note) return;

  function validAppUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    var url;
    try {
      url = new URL(value.trim());
    } catch (e) {
      return null;
    }
    // 只接受 https，且地址里不能携带账号或密码
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  }

  function setDisabled(message) {
    cta.removeAttribute('href');
    cta.setAttribute('aria-disabled', 'true');
    cta.classList.add('is-disabled');
    note.textContent = message;
  }

  function setEnabled(href) {
    cta.setAttribute('href', href);
    cta.removeAttribute('aria-disabled');
    cta.classList.remove('is-disabled');
    note.textContent = '将打开在线应用，登录在应用内完成。体验服务为临时部署，可能暂时不可用。';
  }

  cta.addEventListener('click', function (e) {
    if (cta.getAttribute('aria-disabled') === 'true') e.preventDefault();
  });

  setDisabled('正在读取体验地址…');

  fetch('config.json', { cache: 'no-store', credentials: 'omit' })
    .then(function (res) {
      if (!res.ok) throw new Error('config ' + res.status);
      return res.json();
    })
    .then(function (config) {
      var href = validAppUrl(config && config.application_url);
      if (href) setEnabled(href);
      else setDisabled('在线体验暂未开放：尚未配置有效的 HTTPS 体验地址。');
    })
    .catch(function () {
      setDisabled('暂时无法读取体验地址，请稍后刷新重试。');
    });
})();
