// テスト用の入口とデバッグ表示（MGW-TD-0004 §6）
import type { GameState, StepInput } from '../core/types';

export type DataKey = 'screen' | 'overlay' | 'status' | 'score' | 'high' | 'lives' | 'displayMode' | 'touch' | 'update' | 'audio';

/** body の data 属性（いつも付ける） */
export function setData(key: DataKey, value: string | number): void {
  document.body.dataset[key] = String(value);
}

export const isDebug = new URLSearchParams(location.search).get('debug') === '1';

export interface DebugApi {
  simulateUpdate?: () => void;
  /** 今の GameState の写し（プレイ以外は null） */
  getState?: () => GameState | null;
  /** 今の状態に値を上書きする */
  setState?: (patch: Partial<GameState>) => void;
  /** ループを止める・動かす */
  freeze?: (on: boolean) => void;
  /** ループを止めたまま、決まった入力で steps だけ進めて描く */
  advance?: (steps: number, input?: Partial<StepInput>) => void;
}

/** `?debug=1` のときだけ window.__mgw に関数を足す */
export function exposeDebug(api: DebugApi): void {
  if (!isDebug) return;
  const w = window as unknown as { __mgw?: DebugApi };
  w.__mgw = { ...w.__mgw, ...api };
}

/** 直近 1 秒の描画の回数（fps）と、進めたステップの数 */
export interface StepStats {
  frame(now: number, steps: number): void;
  fps(): number;
  stepsPerSecond(): number;
}

export function createStepStats(): StepStats {
  let frames: { at: number; steps: number }[] = [];
  return {
    frame(now, steps) {
      frames.push({ at: now, steps });
      frames = frames.filter((f) => f.at > now - 1000);
    },
    fps: () => frames.length,
    stepsPerSecond: () => frames.reduce((sum, f) => sum + f.steps, 0),
  };
}

/** 画面の左下に fps・1 秒あたりのステップ数・状態を出す（MGW-GUI-0003 §5） */
export function createDebugPanel(root: HTMLElement): { update(stats: StepStats, status: string): void } {
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  root.append(panel);
  return {
    update(stats, status) {
      panel.textContent = `fps ${stats.fps()}  steps/s ${stats.stepsPerSecond()}  ${status || '-'}`;
    },
  };
}
