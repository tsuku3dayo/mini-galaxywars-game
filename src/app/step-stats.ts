// デバッグ表示の fps と 1 秒あたりのステップ数（MGW-TD-0004 §6.2）。DOM に触れない

/** 直近 1 秒ほどの描画から、1 秒あたりの描画の回数と、進めたステップの数を求める */
export interface StepStats {
  frame(now: number, steps: number): void;
  fps(): number;
  stepsPerSecond(): number;
}

const WINDOW_MS = 1000;

export function createStepStats(): StepStats {
  let frames: { at: number; steps: number }[] = [];
  // 窓の最初の描画から最後の描画までの時間で割る。窓に入った回数で数えると、描画の時刻の揺れで 61 回入ったときに 122 と出てしまうため
  const rate = (count: (f: { steps: number }) => number) => {
    if (frames.length < 2) return 0;
    const span = frames[frames.length - 1]!.at - frames[0]!.at;
    if (span <= 0) return 0;
    const total = frames.slice(1).reduce((sum, f) => sum + count(f), 0);
    return (total * 1000) / span;
  };
  return {
    frame(now, steps) {
      frames.push({ at: now, steps });
      frames = frames.filter((f) => f.at >= now - WINDOW_MS);
    },
    fps: () => rate(() => 1),
    stepsPerSecond: () => rate((f) => f.steps),
  };
}
