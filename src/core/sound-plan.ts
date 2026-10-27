// 音の計画（MGW-TD-0002 §8）。前のステップと次のステップの状態を比べて、鳴らす音を決める
import type { GameState } from './types';

export type SoundCommand = 'jetOn' | 'jetOff' | 'ufoDestroyed' | 'extend' | 'miss';

/** 噴射の音が鳴っているべき状態か（発射後に噴射しているときだけ） */
const jetting = (s: GameState) => s.status === 'playing' && s.missile.isBoosting;

export function planSounds(prev: GameState, next: GameState): SoundCommand[] {
  const commands: SoundCommand[] = [];
  // 噴射が始まった・終わった（playing でなくなったときも止める）
  if (!jetting(prev) && jetting(next)) commands.push('jetOn');
  if (jetting(prev) && !jetting(next)) commands.push('jetOff');
  if (next.killCount > prev.killCount) commands.push('ufoDestroyed');
  if (!prev.extended && next.extended) commands.push('extend');
  if (prev.waitReason !== 'miss' && next.waitReason === 'miss') commands.push('miss');
  return commands;
}
