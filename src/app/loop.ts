// requestAnimationFrame とステップの実行（MGW-TD-0004 §5）
import { planSteps } from '../core/timestep';

export interface Loop {
  start(): void;
  stop(): void;
  readonly running: boolean;
}

/** 描画のたびに、経過時間から進めるステップ数を決めて onFrame(steps) を呼ぶ */
export function createLoop(onFrame: (steps: number, now: number) => void): Loop {
  let handle = 0;
  let last = 0;
  let acc = 0;
  let running = false;

  const frame = (now: number) => {
    const plan = planSteps(acc, last === 0 ? 0 : now - last);
    acc = plan.acc;
    last = now;
    onFrame(plan.steps, now);
    if (running) handle = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      acc = 0;
      handle = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(handle);
    },
    get running() {
      return running;
    },
  };
}
