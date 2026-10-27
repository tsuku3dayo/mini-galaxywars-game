// プレイ画面の中央の表示（MGW-GUI-0003 §4、MGW-TD-0004 §5）。PAUSE は MGW-TASK-0012、ランキング登録への分かれ道は MGW-TASK-0018 で足す
import { STEPS_PER_SECOND } from '../../core/config';
import type { GameState } from '../../core/types';
import { setData } from '../debug';

/** 終わったあと、TITLE を出すまでの時間（時刻で数える） */
export const END_WAIT_MS = 3000;

export interface PlayOverlay {
  update(state: GameState | null): void;
}

export function createPlayOverlay(root: HTMLElement): PlayOverlay {
  const section = document.createElement('section');
  section.id = 'overlay-message';
  const main = document.createElement('p');
  main.className = 'message-main';
  const sub = document.createElement('p');
  sub.className = 'message-sub';
  const title = document.createElement('a');
  title.className = 'button';
  title.href = '#/title';
  title.textContent = 'TITLE';
  section.append(main, sub, title);
  root.append(section);

  let endedAt: number | null = null;

  return {
    update(state) {
      let mainText = '';
      let subText = '';
      let overlay = 'none';
      let showTitle = false;
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
        // READY はゲームの最初の発射前の 1 秒だけ
        if (state?.status === 'ready' && state.stepCount < STEPS_PER_SECOND) mainText = 'READY';
      }
      main.textContent = mainText;
      sub.textContent = subText;
      sub.hidden = subText === '';
      title.hidden = !showTitle;
      section.hidden = mainText === '';
      setData('overlay', overlay);
    },
  };
}
