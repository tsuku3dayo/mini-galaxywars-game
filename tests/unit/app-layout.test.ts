import { describe, expect, it } from 'vitest';
import { computeLayout } from '../../src/app/layout';

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };

describe('大きさの合わせ方（MGW-GUI-0001 §3）', () => {
  it('MGW-TC-0005-01 論理座標 480 × 640 を、縦横比 3:4 を保って拡大・縮小する（計算）', () => {
    // 上のバーはなく、まわりの余白 8 とボタンの段（論理 64）で計算する（仕様書 v1.7）
    // PC（1280 × 800）：高さで決まる。使える高さ 800 − 16 = 784 を、640 + 64 で分ける
    const pc = computeLayout({ innerWidth: 1280, innerHeight: 800, insets: noInsets, touch: false });
    expect(pc.scale).toBeCloseTo(784 / 704, 9);
    expect(pc.stageW / pc.stageH).toBeCloseTo(3 / 4, 9);
    expect(pc.controlH).toBe(0);
    expect(pc.buttonsH).toBeCloseTo(64 * pc.scale, 9);

    // iPhone 11 のホーム画面のアプリ（414 × 896、上 48・下 34）、操作空間あり：幅で決まる（414 − 16 = 398）
    const home = computeLayout({ innerWidth: 414, innerHeight: 896, insets: { top: 48, right: 0, bottom: 34, left: 0 }, touch: true });
    expect(home.scale).toBeCloseTo(398 / 480, 9);
    expect(home.stageW).toBeCloseTo(398, 9);
    expect(home.controlH).toBeCloseTo((96 * 398) / 480, 9);

    // iPhone SE の Safari（375 × 約 594）、操作空間あり：高さで決まる。ボタンの段は 64 × 0.7225 = 46.2 で 48 に届かないので、
    // 段を 48 にして残りの 530 を 640 + 96 で分ける。ゲーム・操作空間・ボタンの段が余白の中に収まる
    const se = computeLayout({ innerWidth: 375, innerHeight: 594, insets: noInsets, touch: true });
    expect(se.scale).toBeCloseTo(530 / 736, 9);
    expect(se.buttonsH).toBe(48);
    expect(8 + se.stageH + se.controlH + se.buttonsH + 8).toBeLessThanOrEqual(594 + 1e-9);
    expect(se.stageW).toBeLessThanOrEqual(375 - 16);

    // とても小さい画面（320 × 568、幅で決まる 0.633）：ボタンの段は 48 より低くしない（ボタン 44 がはみ出さない）
    const small = computeLayout({ innerWidth: 320, innerHeight: 568, insets: noInsets, touch: true });
    expect(small.scale).toBeCloseTo(304 / 480, 9);
    expect(small.buttonsH).toBe(48);
    expect(8 + small.stageH + small.controlH + small.buttonsH + 8).toBeLessThanOrEqual(568 + 1e-9);
    // 高さが足りないときは、段を 48 にして、残りでゲーム画面の倍率を決める
    const short = computeLayout({ innerWidth: 1280, innerHeight: 400, insets: noInsets, touch: false });
    expect(short.buttonsH).toBe(48);
    expect(short.scale).toBeCloseTo((384 - 48) / 640, 9);
  });
});
