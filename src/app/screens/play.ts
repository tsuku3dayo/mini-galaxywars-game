// プレイ画面の中央の表示・出撃待ちの案内・一時停止のボタン（MGW-GUI-0003 §2・§4、MGW-TD-0004 §2・§4・§5）
import { STEPS_PER_SECOND } from '../../core/config';
import { clearTimeMs } from '../../core/scoring';
import type { GameState } from '../../core/types';
import { pad5 } from '../../render/hud';
import { button } from '../button';
import { setData } from '../debug';

/** 終わったあと、TITLE を出すまでの時間（時刻で数える） */
export const END_WAIT_MS = 3000;

export interface PlayOverlay {
  update(state: GameState | null): void;
}

/** ボタンの段の左の一時停止（プレイ中だけ。押しても発射・移動しない） */
export function createPauseButton(row: HTMLElement, onToggle: () => void): void {
  const pause = button('一時停止', onToggle, 'pause');
  pause.id = 'pause-button';
  row.append(pause);
}

/** クリアの表示の 4 行（MGW-TD-0004 §5）：UFO の得点・タイム（小数第 1 位で切り捨て）・時間ボーナス・合計 */
export function clearResultLines(state: Pick<GameState, 'score' | 'timeBonus' | 'playSteps'>): string[] {
  // 等幅の文字で、値の始まりをそろえる（ラベルは 5 文字にそろえて空白 1 つ）
  return [
    `UFO   ${pad5(state.score - state.timeBonus)}`,
    `TIME  ${(clearTimeMs(state.playSteps) / 1000).toFixed(1)}`,
    `BONUS ${pad5(state.timeBonus)}`,
    `TOTAL ${pad5(state.score)}`,
  ];
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
  // クリアの結果：UFO・TIME・BONUS・TOTAL（仕様書 v1.9）
  const result = document.createElement('div');
  result.className = 'message-result';
  const resume = button('RESUME', onResume);
  const title = document.createElement('a');
  title.className = 'button';
  title.href = '#/title';
  title.textContent = 'TITLE';
  section.append(main, sub, result, resume, title);
  root.append(section);

  let endedAt: number | null = null;
  /** 待ったあとの行き先（null はまだ決めていない） */
  let toEntry: boolean | null = null;

  return {
    update(state) {
      let mainText = '';
      let subText = '';
      let resultLines: string[] = [];
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
        if (cleared) resultLines = clearResultLines(state);
        if (now - endedAt >= END_WAIT_MS) {
          toEntry ??= onEnd(state.score);
          showTitle = !toEntry;
          if (toEntry) {
            // 名前の入力を重ねるので、中央の表示は消す
            mainText = '';
            resultLines = [];
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
      result.replaceChildren(...resultLines.map((line) => Object.assign(document.createElement('p'), { textContent: line })));
      result.hidden = resultLines.length === 0;
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
