// キー・ポインター → StepInput（MGW-TD-0004 §4）。タッチの操作空間は MGW-TASK-0013、P・Esc は MGW-TASK-0012 で足す
import { FIELD_WIDTH } from '../core/config';
import type { GameStatus, StepInput } from '../core/types';

export interface InputEngine {
  /** ステップごとに 1 つの入力にまとめる。launch は 1 度だけ true を返して消す */
  takeStepInput(status: GameStatus): StepInput;
  /** 画面を離れるときなどに、押している状態を忘れる */
  reset(): void;
}

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);

export function createInputEngine(field: HTMLElement): InputEngine {
  let left = false;
  let right = false;
  let space = false;
  let pointerDown = false;
  let pointerX: number | null = null;
  let launchPending = false;

  const toLogicalX = (clientX: number) => {
    const rect = field.getBoundingClientRect();
    return rect.width > 0 ? ((clientX - rect.left) / rect.width) * FIELD_WIDTH : null;
  };

  addEventListener('keydown', (e) => {
    if (LEFT.has(e.code) || RIGHT.has(e.code)) {
      if (LEFT.has(e.code)) left = true;
      else right = true;
      // キーで動かすときは、マウスの位置を追わない
      pointerX = null;
      e.preventDefault();
    } else if (e.code === 'Space') {
      if (!e.repeat) launchPending = true;
      space = true;
      e.preventDefault();
    }
  });
  addEventListener('keyup', (e) => {
    if (LEFT.has(e.code)) left = false;
    if (RIGHT.has(e.code)) right = false;
    if (e.code === 'Space') space = false;
  });
  addEventListener('blur', () => {
    left = right = space = pointerDown = false;
  });

  field.addEventListener('pointerdown', (e) => {
    pointerDown = true;
    pointerX = toLogicalX(e.clientX);
    field.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  field.addEventListener('pointermove', (e) => {
    pointerX = toLogicalX(e.clientX);
  });
  const release = (e: PointerEvent) => {
    if (!pointerDown) return;
    pointerDown = false;
    // 離したときに発射する（ready のときだけ使われる）
    if (e.type === 'pointerup') launchPending = true;
  };
  field.addEventListener('pointerup', release);
  field.addEventListener('pointercancel', release);

  return {
    takeStepInput(status) {
      const dir = left === right ? 0 : left ? -1 : 1;
      const input: StepInput = {
        dir,
        targetX: dir === 0 ? pointerX : null,
        launch: launchPending && status === 'ready',
        boost: status === 'playing' && (space || pointerDown),
      };
      launchPending = false;
      return input;
    },
    reset() {
      left = right = space = pointerDown = launchPending = false;
      pointerX = null;
    },
  };
}
