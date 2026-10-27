// プレイ画面の中央の表示と Pause（MGW-GUI-0003 §2・§4、MGW-TD-0004 §4・§5）。ランキング登録への分かれ道は MGW-TASK-0018 で足す
import { STEPS_PER_SECOND } from '../../core/config';
import type { GameState } from '../../core/types';
import { setData } from '../debug';

/** 終わったあと、TITLE を出すまでの時間（時刻で数える） */
export const END_WAIT_MS = 3000;

export interface PlayOverlay {
  update(state: GameState | null): void;
}

/** 押したあとに枠が残ると、Space でもう一度押されてしまうので、押したらすぐ外す */
function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', () => {
    onClick();
    b.blur();
  });
  return b;
}

/** 上のバーの右の Pause（プレイ中だけ。押しても発射・移動しない） */
export function createPauseButton(topbar: HTMLElement, onToggle: () => void): void {
  const pause = button('Pause', onToggle);
  pause.id = 'pause-button';
  topbar.append(pause);
}

export function createPlayOverlay(root: HTMLElement, onResume: () => void): PlayOverlay {
  const section = document.createElement('section');
  section.id = 'overlay-message';
  const main = document.createElement('p');
  main.className = 'message-main';
  const sub = document.createElement('p');
  sub.className = 'message-sub';
  const resume = button('RESUME', onResume);
  const title = document.createElement('a');
  title.className = 'button';
  title.href = '#/title';
  title.textContent = 'TITLE';
  section.append(main, sub, resume, title);
  root.append(section);

  let endedAt: number | null = null;

  return {
    update(state) {
      let mainText = '';
      let subText = '';
      let overlay = 'none';
      let showTitle = false;
      const paused = state?.status === 'paused';
      if (state && (state.status === 'cleared' || state.status === 'gameOver')) {
        const now = performance.now();
        endedAt ??= now;
        const cleared = state.status === 'cleared';
        mainText = cleared ? 'GOOD!!' : 'GAME OVER';
        subText = cleared ? 'STAGE CLEAR' : '';
        overlay = cleared ? 'clear' : 'gameover';
        showTitle = now - endedAt >= END_WAIT_MS;
      } else {
        endedAt = null;
        if (paused) {
          mainText = 'PAUSE';
          overlay = 'pause';
        } else if (state?.status === 'ready' && state.stepCount < STEPS_PER_SECOND) {
          // READY はゲームの最初の発射前の 1 秒だけ
          mainText = 'READY';
        }
      }
      main.textContent = mainText;
      sub.textContent = subText;
      sub.hidden = subText === '';
      resume.hidden = !paused;
      title.hidden = !showTitle;
      section.hidden = mainText === '';
      // 一時停止の間は、うしろを暗くする
      section.classList.toggle('dim', paused);
      setData('overlay', overlay);
    },
  };
}
