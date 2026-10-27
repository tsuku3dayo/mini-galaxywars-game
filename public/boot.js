// 起動の復旧（MGW-ADR-0004、MGW-TD-0007 §3、MGW-GUI-0007 §2）
// アプリ本体より先に読む普通のスクリプト。古い端末でもこのファイルだけは動くように ES5 で書く
(function () {
  'use strict';

  var TIMEOUT_MS = 8000; // 仕様書 §23
  var SCOPE_PATH = '/mini-galaxywars-game/';
  var CACHE_PREFIX = 'mini-galaxywars';

  var timer = setTimeout(showRecovery, TIMEOUT_MS);

  // main.ts が画面を出したら呼ぶ
  window.__mgwBooted = function () {
    clearTimeout(timer);
  };

  function showRecovery() {
    if (document.getElementById('boot-recovery')) return;
    var app = document.getElementById('app');
    if (app) app.style.display = 'none';

    var box = document.createElement('div');
    box.id = 'boot-recovery';
    box.setAttribute('role', 'alertdialog');
    box.setAttribute('aria-labelledby', 'boot-recovery-title');
    // アプリの CSS が読めていないこともあるので、見た目はここで決める（ビットマップフォントは使わない）
    box.style.cssText =
      'position:fixed;top:0;right:0;bottom:0;left:0;z-index:100;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;padding:16px;background:#000;color:#fff;' +
      'font:bold 16px sans-serif;text-align:center;';

    var title = document.createElement('p');
    title.id = 'boot-recovery-title';
    title.style.cssText = 'margin:0 0 24px;font-size:20px;';
    title.appendChild(document.createTextNode('起動できませんでした'));
    box.appendChild(title);

    box.appendChild(makeButton('再読み込み', reload));
    box.appendChild(makeButton('キャッシュを消して再読み込み', clearAndReload));

    var note = document.createElement('p');
    note.style.cssText = 'margin:24px 0 0;';
    note.appendChild(document.createTextNode('ランキングは消えません'));
    box.appendChild(note);

    document.body.appendChild(box);
  }

  function makeButton(label, onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.style.cssText =
      'display:block;width:100%;max-width:320px;min-height:44px;margin:8px 0;padding:6px 16px;' +
      'font:bold 18px sans-serif;color:#fff;background:#000;border:2px solid #fff;';
    button.appendChild(document.createTextNode(label));
    button.addEventListener('click', onClick);
    return button;
  }

  function reload() {
    location.reload();
  }

  // Service Worker の登録とこのアプリのキャッシュだけを消す。localStorage（ランキング・設定）には触れない
  function clearAndReload() {
    var tasks = [];
    var P = window.Promise;
    if (P) {
      if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
        tasks.push(
          navigator.serviceWorker.getRegistrations().then(function (registrations) {
            var removing = [];
            for (var i = 0; i < registrations.length; i++) {
              if (pathOf(registrations[i].scope) === SCOPE_PATH) removing.push(registrations[i].unregister());
            }
            return P.all(removing);
          })
        );
      }
      if (window.caches) {
        tasks.push(
          caches.keys().then(function (keys) {
            var removing = [];
            for (var i = 0; i < keys.length; i++) {
              if (keys[i].indexOf(CACHE_PREFIX) === 0) removing.push(caches['delete'](keys[i]));
            }
            return P.all(removing);
          })
        );
      }
    }
    if (tasks.length === 0) {
      reload();
      return;
    }
    // 消せなかったときも読み込み直す
    P.all(tasks).then(reload, reload);
  }

  function pathOf(url) {
    var a = document.createElement('a');
    a.href = url;
    var path = a.pathname;
    return path.charAt(0) === '/' ? path : '/' + path;
  }
})();
