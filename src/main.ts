// 起動（MGW-TD-0001）。画面とゲームは WS-0002 以降で組み立てる
import './style.css';
import { exposeDebug, isDebug, setData } from './app/debug';
import { setupPwa } from './app/pwa';
import { watchRoute, type Screen } from './app/router';
import { createUpdateBanner } from './app/screens/update-banner';

declare global {
  interface Window {
    /** public/boot.js が用意する。起動を知らせる */
    __mgwBooted?: () => void;
  }
}

const stage = document.getElementById('stage')!;
let screen: Screen = 'title';
let updateWaiting = false;

const updater = setupPwa(() => {
  updateWaiting = true;
  setData('update', 'waiting');
  banner.refresh(screen, updateWaiting);
});

const banner = createUpdateBanner(stage, () => {
  if (isDebug && !updater.isWaiting()) {
    // simulateUpdate のときは読み込み直さず、押されたことだけを残す（MGW-TD-0004 §6.2）
    setData('update', 'applied');
    return;
  }
  updater.apply();
});

setData('update', 'none');
watchRoute((next) => {
  screen = next;
  setData('screen', screen);
  banner.refresh(screen, updateWaiting);
});

// 画面を出したので、boot.js の復旧のタイマーを止める（MGW-TD-0007 §3）
window.__mgwBooted?.();

exposeDebug({
  simulateUpdate() {
    updateWaiting = true;
    setData('update', 'waiting');
    banner.refresh(screen, updateWaiting);
  },
});
