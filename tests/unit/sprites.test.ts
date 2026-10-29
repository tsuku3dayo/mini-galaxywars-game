import { describe, expect, it } from "vitest";
import {
  BEAM_H,
  BEAM_W,
  LAUNCHER_H,
  LAUNCHER_W,
  METEOR_SIZE,
  MISSILE_H,
  MISSILE_W,
  STEPS_PER_SECOND,
  UFO_FRAME_STEPS,
  UFO_H,
  UFO_W,
} from "../../src/core/config";
import { newGame } from "../../src/core/game";
import { meteorAt } from "../../src/core/physics";
import {
  BACKFIRE,
  BEAM,
  beamFrame,
  EXPLOSION,
  FONT,
  LAUNCHER,
  LIFE_ICON,
  METEOR,
  METEOR_TRAIL,
  METEOR_TRAIL_FRAMES,
  meteorTrailFrame,
  meteorTrailX,
  MISSILE,
  type Sprite,
  UFO,
  UFO_FRAMES,
  ufoFrame,
} from "../../src/render/sprites";

/** 行の数・どの行の長さも、決めた大きさと同じ */
function expectSize(sprite: Sprite, w: number, h: number) {
  expect([sprite.w, sprite.h]).toEqual([w, h]);
  expect(sprite.rows).toHaveLength(h);
  for (const row of sprite.rows)
    expect(row).toMatch(new RegExp(`^[#.]{${w}}$`));
}

describe("ドット絵とフォント（MGW-TD-0003 §3・§4）", () => {
  it("MGW-TC-0006-06 発射台は幅 48 × 高さ 16、ミサイルは幅 12 × 高さ 24（絵の大きさ）", () => {
    expectSize(LAUNCHER, LAUNCHER_W, LAUNCHER_H);
    expectSize(MISSILE, MISSILE_W, MISSILE_H);
  });

  it("ほかの絵の大きさが設計どおり", () => {
    expectSize(UFO, UFO_W, UFO_H);
    expectSize(METEOR, METEOR_SIZE, METEOR_SIZE);
    expect(BEAM).toHaveLength(2);
    for (const frame of BEAM) expectSize(frame, BEAM_W, BEAM_H);
    // 2 枚の光線は形が違う（揺れて見える）
    expect(BEAM[0]!.rows).not.toEqual(BEAM[1]!.rows);
    expectSize(BACKFIRE, 8, 12);
    expect(EXPLOSION).toHaveLength(2);
    for (const frame of EXPLOSION) expectSize(frame, 32, 32);
    expectSize(LIFE_ICON, 16, 6);
  });

  it("UFO の絵の形が、部位の四角（MGW-TD-0002 §7.1）とそろう（2 コマとも）", () => {
    for (const frame of UFO_FRAMES) {
      // 絵の行 r は UFO の中心から y = r − 12、列 c は x = c − 16
      const dot = (x: number, y: number) => frame.rows[y + 12]![x + 16] === "#";
      // 本体（y −12〜4）の真ん中の段は横いっぱい
      expect(dot(-16, -3) && dot(15, -3)).toBe(true);
      // 本体より下では、中央のふくらみ（x −6〜6）と突起（x ±8〜14）の外には点がない
      for (let y = 4; y < 12; y++) {
        for (let x = -16; x < 16; x++) {
          const inBottom = x >= -6 && x < 6 && y < 8;
          const inProng = (x >= -14 && x < -8) || (x >= 8 && x < 14);
          if (dot(x, y)) expect(inBottom || inProng).toBe(true);
        }
      }
    }
  });

  it("MGW-TC-0008-03 UFO は 2 コマの絵を 0.25 秒ごとに切り替え、羽ばたくように見える", () => {
    expect(UFO_FRAMES).toHaveLength(2);
    for (const frame of UFO_FRAMES) expectSize(frame, UFO_W, UFO_H);
    expect(UFO_FRAMES[0]).toBe(UFO);
    // 2 枚は形が違う
    expect(UFO_FRAMES[0].rows).not.toEqual(UFO_FRAMES[1].rows);
    // 0.25 秒（30 ステップ）ごとに切り替わる
    expect(UFO_FRAME_STEPS / STEPS_PER_SECOND).toBe(0.25);
    expect([0, 29, 30, 59, 60, 90].map(ufoFrame)).toEqual([0, 0, 1, 1, 0, 1]);
    // 1 秒で 4 回切り替わる
    let changes = 0;
    for (let t = 1; t <= STEPS_PER_SECOND; t++)
      if (ufoFrame(t) !== ufoFrame(t - 1)) changes++;
    expect(changes).toBe(4);
  });

  it("MGW-TC-0009-06 光線は波の形で描き、2 コマ（幅 1 点の細い波と、それを左右に裏返した波）を、UFO と同じく 0.25 秒ごとに切り替える", () => {
    expect(BEAM).toHaveLength(2);
    for (const frame of BEAM) expectSize(frame, BEAM_W, BEAM_H);
    // オーナーの画像（銀河戦争ミニ_弾1・弾2）を点で読み取った 15 行。16 行目は同じ波の続き
    const image1 = ["#...", ".#..", "..#.", "...#", "...#", "..#.", ".#..", "#...", ".#..", "..#.", "...#", "...#", "..#.", ".#..", "#..."];
    const image2 = image1.map((r) => [...r].reverse().join(""));
    expect(BEAM[0]!.rows.slice(0, 15)).toEqual(image1);
    expect(BEAM[1]!.rows.slice(0, 15)).toEqual(image2);
    expect(BEAM[0]!.rows[15]).toBe(".#..");
    expect(BEAM[1]!.rows[15]).toBe("..#.");
    // どの行にも点が 1 つ（幅 1 点）で、となりの行とつながる（波の形）
    for (const frame of BEAM)
      frame.rows.forEach((row, i) => {
        expect([...row].filter((c) => c === "#")).toHaveLength(1);
        if (i > 0) expect(Math.abs(row.indexOf("#") - frame.rows[i - 1]!.indexOf("#"))).toBeLessThanOrEqual(1);
      });
    // UFO と同じ時に切り替える（0.25 秒ごと）
    for (let t = 0; t < STEPS_PER_SECOND * 2; t++) expect(beamFrame(t)).toBe(ufoFrame(t));
  });

  it("MGW-TC-0010-09 隕石の尾は 2 コマ（3 本とも長さ 8 と、上下の線を長さ 6 にしたもの）を、UFO と同じく 0.25 秒ごとに切り替える", () => {
    expect(METEOR_TRAIL_FRAMES).toHaveLength(2);
    for (const frame of METEOR_TRAIL_FRAMES) expectSize(frame, 8, 7);
    const lines = (frame: Sprite) => frame.rows.filter((r) => r.includes("#"));
    expect(lines(METEOR_TRAIL_FRAMES[0])).toEqual(["########", "########", "########"]);
    expect(lines(METEOR_TRAIL_FRAMES[1])).toEqual([".######.", "########", ".######."]);
    // 線の段（y 0・3・6）は 2 コマとも同じ。左右対称なので、向きで描き分けなくてよい
    for (const frame of METEOR_TRAIL_FRAMES) {
      expect([0, 3, 6].every((y) => frame.rows[y]!.includes("#"))).toBe(true);
      for (const r of frame.rows) expect([...r].reverse().join("")).toBe(r);
    }
    for (let t = 0; t < STEPS_PER_SECOND * 2; t++) expect(meteorTrailFrame(t)).toBe(ufoFrame(t));
  });
  it("MGW-TC-0010-05 隕石には、進む向きの後ろに尾が付き、向きが分かる", () => {
    expectSize(METEOR_TRAIL, 8, 7);
    // 3 本の横線
    expect(METEOR_TRAIL.rows.filter((r) => r === "########")).toHaveLength(3);
    const right = meteorAt(100);
    const left = meteorAt(456 + 100);
    expect([right.direction, left.direction]).toEqual([1, -1]);
    // 右へ進むときは左に、左へ進むときは右に、隕石の端に付ける（間をあけず、重ならない）
    expect(meteorTrailX(right)).toBe(right.x - 16);
    expect(meteorTrailX(left)).toBe(left.x + 16);
    expect(meteorTrailX(right) + METEOR_TRAIL.w / 2).toBe(
      right.x - METEOR_SIZE / 2,
    );
    // 初めの 5 個も、それぞれ向きの後ろに付く
    for (const m of newGame(0, 1).meteors)
      expect(Math.sign(m.x - meteorTrailX(m))).toBe(m.direction);
  });

  it("フォントは 0-9・A-Z・空白と ! ? : . - / ( ) の 45 文字を、5 × 7 で持つ", () => {
    const expected = [
      ..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      " ",
      "!",
      "?",
      ":",
      ".",
      "-",
      "/",
      "(",
      ")",
    ];
    expect(Object.keys(FONT).sort()).toEqual(expected.sort());
    for (const rows of Object.values(FONT)) {
      expect(rows).toHaveLength(7);
      for (const row of rows) expect(row).toMatch(/^[#.]{5}$/);
    }
  });
});
