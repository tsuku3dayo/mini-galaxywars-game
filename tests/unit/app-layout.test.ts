import { describe, expect, it } from 'vitest';
import { computeLayout } from '../../src/app/layout';

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };

describe('大きさの合わせ方（MGW-GUI-0001 §3）', () => {
  it('MGW-TC-0005-01 論理座標 480 × 640 を、縦横比 3:4 を保って拡大・縮小する（計算）', () => {
    // PC（1280 × 800）：高さで決まる。使える高さ 800 − 44 = 756
    const pc = computeLayout({ innerWidth: 1280, innerHeight: 800, insets: noInsets, touch: false });
    expect(pc.scale).toBeCloseTo(756 / 640, 9);
    expect(pc.stageW / pc.stageH).toBeCloseTo(3 / 4, 9);
    expect(pc.controlH).toBe(0);

    // iPhone 11 のホーム画面のアプリ（414 × 896、上 48・下 34）、操作空間あり：幅で決まる 0.8625
    const home = computeLayout({ innerWidth: 414, innerHeight: 896, insets: { top: 48, right: 0, bottom: 34, left: 0 }, touch: true });
    expect(home.scale).toBeCloseTo(0.8625, 9);
    expect(home.stageW).toBeCloseTo(414, 9);
    expect(home.controlH).toBeCloseTo(96 * 0.8625, 9);

    // iPhone SE の Safari（375 × 約 594）、操作空間あり：高さで決まる。上のバー・ゲーム・操作空間が収まる
    const se = computeLayout({ innerWidth: 375, innerHeight: 594, insets: noInsets, touch: true });
    expect(se.scale).toBeCloseTo(550 / 736, 9);
    expect(44 + se.stageH + se.controlH).toBeLessThanOrEqual(594 + 1e-9);
    expect(se.stageW).toBeLessThanOrEqual(375);
  });
});
