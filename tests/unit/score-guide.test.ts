import { describe, expect, it } from 'vitest';
import { newGame } from '../../src/core/game';
import { hitPart, killPoints } from '../../src/core/scoring';
import { GUIDE_H, GUIDE_UFO, GUIDE_W, scoreGuideModel, toUfoLocal } from '../../src/render/score-guide';
import { FONT } from '../../src/render/sprites';

describe('タイトル画面の点数の説明（MGW-TD-0003 §7）', () => {
  it('MGW-TC-0014-05 UFO の部位から線を引いて得点（側面・上部 50、下部中央 100、下部突起 150）を示す', () => {
    const lines = scoreGuideModel();
    expect(lines.map((l) => [l.part, l.points, l.label.text])).toEqual([
      ['body', 50, '50'],
      ['bottom', 100, '100'],
      ['prong', 150, '150'],
    ]);
    // 線の始まりは、その部位の四角の中（ゲームの当たりで、その点数になる場所）
    const ufo = newGame(0, 1).ufos[5]!;
    for (const line of lines) {
      const local = toUfoLocal(line.from);
      // その点に小さなミサイルの四角を置くと、書いた点数の部位に当たる（1 機目）
      const hit = hitPart({ x: ufo.x + local.x, y: ufo.y + local.y, w: 0.5, h: 0.5 }, ufo);
      expect(hit?.part, line.part).toBe(line.part);
      expect(killPoints(hit!.part, hit!.points, 0)).toBe(line.points);
    }
    // 4 機目の突起は 600（点数の説明の下に書くヒントの値）
    const prong = lines.find((l) => l.part === 'prong')!;
    const local = toUfoLocal(prong.from);
    const hit = hitPart({ x: ufo.x + local.x, y: ufo.y + local.y, w: 0.5, h: 0.5 }, ufo)!;
    expect(killPoints(hit.part, hit.points, 3)).toBe(600);
    // 線の終わりと数字は UFO の外（UFO は 2 倍で 64 × 48）にあり、Canvas からはみ出さず、数字どうしは重ならない
    const ufoBox = { x0: GUIDE_UFO.x - 32, x1: GUIDE_UFO.x + 32, y0: GUIDE_UFO.y - 24, y1: GUIDE_UFO.y + 24 };
    const inUfo = (p: { x: number; y: number }) => p.x > ufoBox.x0 && p.x < ufoBox.x1 && p.y > ufoBox.y0 && p.y < ufoBox.y1;
    for (const line of lines) {
      expect(inUfo(line.to), line.part).toBe(false);
      const l = line.label;
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.y).toBeGreaterThanOrEqual(0);
      expect(l.x + l.w).toBeLessThanOrEqual(GUIDE_W);
      expect(l.y + l.h).toBeLessThanOrEqual(GUIDE_H);
      // 数字はドットの文字にある
      for (const ch of l.text) expect(FONT[ch]).toBeDefined();
    }
    for (let i = 0; i < lines.length; i++)
      for (let j = i + 1; j < lines.length; j++) {
        const [a, b] = [lines[i]!.label, lines[j]!.label];
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap).toBe(false);
      }
  });
});
