import { describe, expect, it } from 'vitest';
import { newGame, step, togglePause } from '../../src/core/game';
import type { GameState } from '../../src/core/types';
import { showsLauncher, showsMissile } from '../../src/render/view';
import { launch } from './helpers';

describe('発射台・ミサイルを描くかどうか（MGW-TD-0003 §2）', () => {
  it('MGW-TC-0006-08 発射したら、発射台は消える（発射前だけ描く）', () => {
    const ready = { ...newGame(0, 1), meteors: [] };
    expect(showsLauncher(ready)).toBe(true);
    expect(showsMissile(ready)).toBe(true);
    // 発射したら、発射台は描かない。ミサイルは描く
    const playing = launch(ready);
    expect(playing.status).toBe('playing');
    expect(showsLauncher(playing)).toBe(false);
    expect(showsMissile(playing)).toBe(true);
    // 一時停止しても、止めた前のとおり
    expect(showsLauncher(togglePause(ready))).toBe(true);
    expect(showsLauncher(togglePause(playing))).toBe(false);
    expect(showsMissile(togglePause(playing))).toBe(true);
    // 待ち・出撃待ちの間は、どちらも描かない
    for (const status of ['respawn', 'standby'] as const) {
      const waiting: GameState = { ...ready, status };
      expect(showsLauncher(waiting)).toBe(false);
      expect(showsMissile(waiting)).toBe(false);
    }
    // 出撃すると、また発射台を描く
    const deployed = step({ ...ready, status: 'standby' }, { dir: 0, targetX: null, launch: true, boost: false });
    expect(showsLauncher(deployed)).toBe(true);
  });
});
