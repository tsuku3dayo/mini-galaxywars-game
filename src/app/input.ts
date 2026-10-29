// キー・ポインター → StepInput（MGW-TD-0004 §4、MGW-GUI-0003 §3）。P・Esc は main.ts の一時停止
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

/** タップとみなす、置いてから離すまでに動いた距離の上限（未満。CSS px。仕様書 §20） */
export const TAP_SLOP = 10;

/** 置いてから離すまでに動いた距離の最大が TAP_SLOP 未満なら、タップ（発射・出撃）。なぞって離したときは移動だけ */
export function isTap(maxDistance: number): boolean {
  return maxDistance < TAP_SLOP;
}

/**
 * field（ゲーム画面）と、surfaces（操作空間など）のどれを触っても同じに扱う。
 * x はいつもゲーム画面の左右を基準にする（操作空間はゲーム画面と同じ幅・同じ位置に置く）
 */
export function createInputEngine(field: HTMLElement, surfaces: HTMLElement[] = []): InputEngine {
  let left = false;
  let right = false;
  let space = false;
  let pointerDown = false;
  let pointerX: number | null = null;
  let launchPending = false;
  /** 置いた位置と、そこから動いた距離の最大（CSS px） */
  let downAt: { x: number; y: number } | null = null;
  let maxDistance = 0;

  const toLogicalX = (clientX: number) => {
    const rect = field.getBoundingClientRect();
    return rect.width > 0 ? ((clientX - rect.left) / rect.width) * FIELD_WIDTH : null;
  };

  addEventListener('keydown', (e) => {
    // 名前の入力欄で打っている文字（A・D・空白など）は、ゲームの操作にしない
    if (e.target instanceof HTMLInputElement) return;
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

  const track = (e: PointerEvent) => {
    if (!downAt) return;
    maxDistance = Math.max(maxDistance, Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y));
  };
  const release = (e: PointerEvent) => {
    if (!pointerDown) return;
    pointerDown = false;
    track(e);
    // タップ（ほとんど動かさずに離した）ときだけ発射・出撃する（ready・standby のときだけ使われる）。なぞって離したときは移動だけ
    if (e.type === 'pointerup' && isTap(maxDistance)) launchPending = true;
    downAt = null;
  };
  for (const surface of [field, ...surfaces]) {
    surface.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      pointerX = toLogicalX(e.clientX);
      downAt = { x: e.clientX, y: e.clientY };
      maxDistance = 0;
      // 指が枠の外へ出ても追う
      try {
        surface.setPointerCapture(e.pointerId);
      } catch {
        // 捕まえられなくても、枠の中では動く
      }
      e.preventDefault();
    });
    surface.addEventListener('pointermove', (e) => {
      pointerX = toLogicalX(e.clientX);
      track(e);
    });
    surface.addEventListener('pointerup', release);
    surface.addEventListener('pointercancel', release);
    // iPhone では user-select・touch-action だけでは、長押しの虫めがね・メニュー、2 回タップの拡大が止まらない。
    // 指の標準の動きを止める（ゲームの操作はポインターイベントで受けるので、止めても動く）
    surface.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  }

  return {
    takeStepInput(status) {
      const dir = left === right ? 0 : left ? -1 : 1;
      const input: StepInput = {
        dir,
        targetX: dir === 0 ? pointerX : null,
        // ready なら発射、standby なら出撃（MGW-TD-0004 §4）
        launch: launchPending && (status === 'ready' || status === 'standby'),
        boost: status === 'playing' && (space || pointerDown),
      };
      launchPending = false;
      return input;
    },
    reset() {
      left = right = space = pointerDown = launchPending = false;
      pointerX = null;
      downAt = null;
    },
  };
}
