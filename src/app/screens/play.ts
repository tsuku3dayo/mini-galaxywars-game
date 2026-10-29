// プレイ画面の中央の表示・出撃待ちの案内・一時停止のボタン（MGW-GUI-0003 §2・§4、MGW-TD-0004 §2・§4・§5）
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

const SVG_NS = 'http://www.w3.org/2000/svg';

/** 一時停止の印（‖）。インラインの SVG で描く（MGW-GUI-0001 §5.1） */
function pauseIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');
  for (const x of ['4', '10']) {
    const bar = document.createElementNS(SVG_NS, 'rect');
    bar.setAttribute('x', x);
    bar.setAttribute('y', '2');
    bar.setAttribute('width', '2.5');
    bar.setAttribute('height', '12');
    bar.setAttribute('rx', '1');
    bar.setAttribute('fill', 'currentColor');
    svg.append(bar);
  }
  return svg;
}

/** ボタンの段の左の一時停止（プレイ中だけ。押しても発射・移動しない） */
export function createPauseButton(row: HTMLElement, onToggle: () => void): void {
  const pause = button('一時停止', onToggle);
  pause.id = 'pause-button';
  pause.prepend(pauseIcon());
  row.append(pause);
}

/**
 * onEnd は、終わってから END_WAIT_MS たったときに 1 回だけ呼ぶ。
 * ランキング登録（名前の入力）に進んだら true を返す。false なら「TITLE」を出す。
 * hint は出撃待ちの案内（タッチ端末は「タップで出撃」、PC は「クリック/SPACEで出撃」）
 */
export function createPlayOverlay(
  root: HTMLElement,
  hint: HTMLElement,
  touch: boolean,
  onResume: () => void,
  onEnd: (score: number) => boolean,
): PlayOverlay {
  hint.textContent = touch ? 'タップで出撃' : 'クリック/SPACEで出撃';
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
  /** 待ったあとの行き先（null はまだ決めていない） */
  let toEntry: boolean | null = null;

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
        if (now - endedAt >= END_WAIT_MS) {
          toEntry ??= onEnd(state.score);
          showTitle = !toEntry;
          if (toEntry) {
            // 名前の入力を重ねるので、中央の表示は消す
            mainText = '';
            overlay = 'entry';
          }
        }
      } else {
        endedAt = null;
        toEntry = null;
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
      hint.hidden = state?.status !== 'standby';
      setData('overlay', overlay);
    },
  };
}
