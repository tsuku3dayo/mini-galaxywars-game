import { describe, expect, it } from 'vitest';
import { isTap, TAP_SLOP } from '../../src/app/input';

describe('タップの判定（MGW-TD-0004 §4）', () => {
  it('MGW-TC-0006-07 ポインターを押してから離すまでに 10 px 以上動いたときは、発射しない（タップの判定）', () => {
    expect(TAP_SLOP).toBe(10);
    // 動かさない・少しだけ動いた（指のぶれ）はタップ
    expect(isTap(0)).toBe(true);
    expect(isTap(9.99)).toBe(true);
    // 10 px 以上動いた（なぞった）ときはタップではない
    expect(isTap(10)).toBe(false);
    expect(isTap(120)).toBe(false);
  });
});
