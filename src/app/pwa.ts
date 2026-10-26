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
    });
  }
  return {
    isWaiting: () => waiting,
    apply: () => void applyUpdate(true),
  };
}
