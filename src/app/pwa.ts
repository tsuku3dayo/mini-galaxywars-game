// Service Worker の登録と「更新」（MGW-ADR-0004、MGW-TD-0007 §2）
import { registerSW } from 'virtual:pwa-register';

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
    applyUpdate = registerSW({
      onNeedRefresh() {
        waiting = true;
        onNeedRefresh();
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return;
        checkOnResume(registration);
        // iPhone のホーム画面のアプリは、読み込んだだけでは新しい版を確かめないことがあるので、登録の直後にも確かめる
        checkUpdate(registration);
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
    checkUpdate(registration);
  });
}

function checkUpdate(registration: ServiceWorkerRegistration): void {
  registration.update().catch(() => {
    // 確かめられなくても、今の版のまま動かす
  });
}
