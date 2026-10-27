// Web Audio の合成（MGW-TD-0005）。音のファイルは使わない（仕様書 §22）
import type { SoundCommand } from '../core/sound-plan';

export type AudioState = 'running' | 'suspended' | 'unavailable';

export interface Synthesizer {
  /** resume()。iPhone では、最初のタッチの中で呼ぶ。失敗しても投げない（state() が unavailable になる） */
  unlock(): Promise<void>;
  play(commands: SoundCommand[]): void;
  /** 鳴っている音（ジェット音）を止める */
  stopAll(): void;
  state(): AudioState;
}

const MASTER_GAIN = 0.3;
const JET_GAIN = 0.15;
const JET_LOW = 440;
const JET_HIGH = 880;
const JET_SWEEP_S = 0.3;
const UFO_S = 0.4;
const EXTEND_NOTES = [523, 659, 784];
const EXTEND_STEP_S = 0.12;
const EXTEND_LAST_S = 0.3;
const MISS_ATTACK_S = 0.02;
const MISS_S = 0.8;
const NOISE_S = 1;

/** 決まった式の擬似乱数（線形合同法）で作るノイズ。Math.random は使わない（MGW-TD-0005 §2） */
export function noiseSamples(length: number, seed = 1): Float32Array {
  const out = new Float32Array(length);
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out[i] = (s / 2 ** 32) * 2 - 1;
  }
  return out;
}

/** 音を鳴らせないときの作り（何もしない） */
const silent: Synthesizer = {
  unlock: async () => {},
  play: () => {},
  stopAll: () => {},
  state: () => 'unavailable',
};

export function createSynthesizer(make: () => AudioContext = () => new AudioContext()): Synthesizer {
  let ctx: AudioContext;
  try {
    ctx = make();
  } catch {
    return silent;
  }
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(ctx.destination);

  const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * NOISE_S), ctx.sampleRate);
  noiseBuffer.getChannelData(0).set(noiseSamples(noiseBuffer.length));
  const noise = (at: number, duration: number, to: AudioNode) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.connect(to);
    src.start(at);
    src.stop(at + duration);
  };
  const gainTo = (value: number, to: AudioNode = master) => {
    const g = ctx.createGain();
    g.gain.value = value;
    g.connect(to);
    return g;
  };

  let jet: { osc: OscillatorNode; lfo: OscillatorNode } | null = null;
  const jetOff = () => {
    if (!jet) return;
    jet.osc.stop();
    jet.lfo.stop();
    jet = null;
  };

  const sounds: Record<SoundCommand, (t: number) => void> = {
    // 矩形波を 440 → 880 Hz へ 0.3 秒で上げ、くり返す。のこぎり波の LFO で周波数を動かす（-1〜1 → 440〜880）
    jetOn(t) {
      if (jet) return;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = (JET_LOW + JET_HIGH) / 2;
      const lfo = ctx.createOscillator();
      lfo.type = 'sawtooth';
      lfo.frequency.value = 1 / JET_SWEEP_S;
      const depth = ctx.createGain();
      depth.gain.value = (JET_HIGH - JET_LOW) / 2;
      lfo.connect(depth).connect(osc.frequency);
      osc.connect(gainTo(JET_GAIN));
      osc.start(t);
      lfo.start(t);
      jet = { osc, lfo };
    },
    jetOff,
    // ホワイトノイズ（0.4 秒）＋ のこぎり波を 120 → 30 Hz へ指数で下げる。音量を 0.4 秒で 0 へ
    ufoDestroyed(t) {
      const env = gainTo(1);
      env.gain.setValueAtTime(1, t);
      env.gain.linearRampToValueAtTime(0, t + UFO_S);
      noise(t, UFO_S, env);
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + UFO_S);
      osc.connect(env);
      osc.start(t);
      osc.stop(t + UFO_S);
    },
    // 三角波で 523 → 659 → 784 Hz を 0.12 秒ずつ。最後の音は 0.3 秒
    extend(t) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      EXTEND_NOTES.forEach((f, i) => osc.frequency.setValueAtTime(f, t + i * EXTEND_STEP_S));
      osc.connect(gainTo(1));
      osc.start(t);
      osc.stop(t + (EXTEND_NOTES.length - 1) * EXTEND_STEP_S + EXTEND_LAST_S);
    },
    // ホワイトノイズを低域通過フィルター（400 → 80 Hz）に通す。音量を 0.02 秒で上げ、0.8 秒で 0 へ
    miss(t) {
      const env = gainTo(0);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(1, t + MISS_ATTACK_S);
      env.gain.linearRampToValueAtTime(0, t + MISS_S);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + MISS_S);
      filter.connect(env);
      noise(t, MISS_S, filter);
    },
  };

  // 有効にできなかったら、鳴らせないものとして扱う（ゲームは進める。MGW-TD-0004 §7）
  let failed = false;
  return {
    unlock: () =>
      ctx.resume().then(
        () => {
          failed = false;
        },
        () => {
          failed = true;
        },
      ),
    play(commands) {
      // 止まっている（iPhone で有効にする前など）ときは鳴らさない。ジェット音だけは止める
      if (ctx.state !== 'running') {
        if (commands.includes('jetOff')) jetOff();
        return;
      }
      for (const c of commands) sounds[c](ctx.currentTime);
    },
    stopAll: jetOff,
    state: () => (failed ? 'unavailable' : ctx.state === 'running' ? 'running' : 'suspended'),
  };
}
