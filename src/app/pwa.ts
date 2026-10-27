// Service Worker の登録と「更新」（MGW-ADR-0004、MGW-TD-0007 §2）
import { registerSW } from 'virtual:pwa-register';
import { diag, diagRegistration } from './diag';

export interface PwaUpdater {
  /** 新しい版が待っているとき true */
  isWaiting(): boolean;
  /** 待っている版に切り替えて読み込み直す */
  apply(): void;
}

export function setupPwa(onNeedRefresh: () => void): PwaUpdater {
  let waiting = false;
  let applyUpdate: (reload?: boolean) => Promise<void> = async () => {};
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => diag('controllerchange'));
    applyUpdate = registerSW({
      onNeedRefresh() {
        diag('onNeedRefresh（案内を出す）');
        waiting = true;
        onNeedRefresh();
      },
      onRegisteredSW(_url, registration) {
        if (!registration) {
          diag('登録 registration なし');
          return;
        }
        diagRegistration('登録', registration);
        watchInstall(registration);
        checkOnResume(registration);
        // 診断：読み込みのときにブラウザが確かめたかを見るため、登録の直後にも一度確かめる
        checkUpdate(registration, '読み込み');
      },
      onRegisterError(error: unknown) {
        diag(`登録の失敗 ${String(error)}`);
      },
    });
  }
  return {
    isWaiting: () => waiting,
    apply: () => void applyUpdate(true),
  };
}

// iPhone のホーム画面のアプリは、閉じずに前に戻ってくることが多く、そのときは読み込み直さない。
// 画面が見えたときにも新しい版を確かめる（MGW-TD-0007 §2）
function checkOnResume(registration: ServiceWorkerRegistration): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !navigator.onLine) return;
    checkUpdate(registration, '表示');
  });
}

function checkUpdate(registration: ServiceWorkerRegistration, reason: string): void {
  registration.update().then(
    () => diagRegistration(`確認(${reason}) OK`, registration),
    // 確かめられなくても、今の版のまま動かす
    (error: unknown) => diag(`確認(${reason}) 失敗 ${String(error)}`),
  );
}

// 診断：新しい版の取り込みの進み具合を記録する
function watchInstall(registration: ServiceWorkerRegistration): void {
  registration.addEventListener('updatefound', () => {
    const sw = registration.installing;
    diag(`updatefound ${sw ? sw.state : '-'}`);
    sw?.addEventListener('statechange', () => diag(`新しい版 ${sw.state}`));
  });
}
