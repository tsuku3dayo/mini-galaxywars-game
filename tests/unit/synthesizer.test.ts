import { describe, expect, it } from 'vitest';
import { createSynthesizer, noiseSamples } from '../../src/audio/synthesizer';

// AudioContext のまがいもの（MGW-TD-0005 §3）。作ったノードの種類と、周波数・音量の予定を記録する
type Call = [string, ...unknown[]];
class FakeParam {
  value = 0;
  calls: Call[] = [];
  setValueAtTime(v: number, t: number) {
    this.calls.push(['set', v, t]);
  }
  linearRampToValueAtTime(v: number, t: number) {
    this.calls.push(['linear', v, t]);
  }
  exponentialRampToValueAtTime(v: number, t: number) {
    this.calls.push(['exp', v, t]);
  }
}
class FakeNode {
  constructor(
    readonly kind: string,
    readonly log: FakeNode[],
  ) {
    log.push(this);
  }
  type = '';
  frequency = new FakeParam();
  gain = new FakeParam();
  Q = new FakeParam();
  buffer: unknown = null;
  loop = false;
  started: number | null = null;
  stopped: number | null = null;
  connect<T>(to: T) {
    return to;
  }
  start(t = 0) {
    this.started = t;
  }
  stop(t = 0) {
    this.stopped = t;
  }
}
function fakeContext(state: AudioContextState = 'running') {
  const nodes: FakeNode[] = [];
  const ctx = {
    state,
    currentTime: 10,
    sampleRate: 1000,
    destination: {},
    createGain: () => new FakeNode('gain', nodes),
    createOscillator: () => new FakeNode('oscillator', nodes),
    createBiquadFilter: () => new FakeNode('filter', nodes),
    createBufferSource: () => new FakeNode('buffer', nodes),
    createBuffer: (_c: number, length: number) => ({ length, getChannelData: () => new Float32Array(length) }),
    resume: async () => {
      ctx.state = 'running';
    },
  };
  return { ctx, nodes };
}
const make = (state?: AudioContextState) => {
  const fake = fakeContext(state);
  const synth = createSynthesizer(() => fake.ctx as unknown as AudioContext);
  return { synth, nodes: fake.nodes, ctx: fake.ctx };
};
const oscillators = (nodes: FakeNode[]) => nodes.filter((n) => n.kind === 'oscillator');

describe('音の合成（MGW-TD-0005）', () => {
  it('噴射音（MGW-TC-0023-01 の音色）：ノイズを帯域通過フィルター（1,200 Hz、Q 0.8）に通した「シュー」を、jetOn から jetOff まで鳴らす', () => {
    const { synth, nodes } = make();
    synth.play(['jetOn']);
    // 矩形波などのオシレーターは使わず、くり返すノイズだけ
    expect(oscillators(nodes)).toHaveLength(0);
    const src = nodes.find((n) => n.kind === 'buffer')!;
    expect(src.loop).toBe(true);
    expect(src.started).toBe(10);
    expect(src.stopped).toBeNull();
    const filter = nodes.find((n) => n.kind === 'filter')!;
    expect(filter.type).toBe('bandpass');
    expect(filter.frequency.value).toBe(1200);
    expect(filter.Q.value).toBe(0.8);
    // 0.05 秒で音量 0.12 に上げる
    const env = nodes.find((n) => n.kind === 'gain' && n.gain.calls.length > 0)!;
    expect(env.gain.calls).toEqual([
      ['set', 0, 10],
      ['linear', 0.12, 10.05],
    ]);
    // 2 回目の jetOn では重ねない
    synth.play(['jetOn']);
    expect(nodes.filter((n) => n.kind === 'buffer')).toHaveLength(1);
    // jetOff：0.08 秒で 0 に下げてから止める
    synth.play(['jetOff']);
    expect(env.gain.calls.slice(2)).toEqual([
      ['set', 0.12, 10],
      ['linear', 0, 10.08],
    ]);
    expect(src.stopped).toBeCloseTo(10.08, 9);
    // 止めたあとの jetOff は何もしない。もう一度 jetOn で鳴らし直せる
    synth.play(['jetOff']);
    synth.play(['jetOn']);
    expect(nodes.filter((n) => n.kind === 'buffer')).toHaveLength(2);
  });

  it('MGW-TC-0023-10 上の音は、効果音がオンのときだけ鳴る', () => {
    // オン（初め）：4 種とも音のノードを作る
    const on = make();
    on.synth.play(['ufoDestroyed', 'extend', 'miss', 'jetOn']);
    expect(on.nodes.filter((n) => n.kind !== 'gain').length).toBeGreaterThan(0);
    // オフ：どれもノードを作らない
    const off = make();
    off.synth.setEnabled(false);
    const before = off.nodes.length;
    off.synth.play(['jetOn', 'ufoDestroyed', 'extend', 'miss', 'jetOff']);
    expect(off.nodes.length).toBe(before);
    // オンに戻すと、また鳴る
    off.synth.setEnabled(true);
    off.synth.play(['extend']);
    expect(oscillators(off.nodes)).toHaveLength(1);
  });

  it('MGW-TC-0034-03 オフのときは、どの効果音も鳴らない。噴射音が鳴っているときに押すと、すぐ止まる', () => {
    const { synth, nodes, ctx } = make();
    synth.play(['jetOn']);
    const src = nodes.find((n) => n.kind === 'buffer')!;
    const env = nodes.find((n) => n.kind === 'gain' && n.gain.calls.length > 0)!;
    expect(src.stopped).toBeNull();
    // オフにすると、0.08 秒かけずに今すぐ止める
    ctx.currentTime = 12;
    synth.setEnabled(false);
    expect(src.stopped).toBe(12);
    expect(env.gain.calls.at(-1)).toEqual(['set', 0, 12]);
    // オフの間は、噴射を始めても鳴らさない
    const count = nodes.length;
    synth.play(['jetOn', 'miss']);
    expect(nodes.length).toBe(count);
    // オンに戻しても、噴射音は鳴らし直さない（次の jetOn から鳴る）
    synth.setEnabled(true);
    expect(nodes.length).toBe(count);
    synth.play(['jetOn']);
    expect(nodes.filter((n) => n.kind === 'buffer')).toHaveLength(2);
    // オフの間も unlock は効く（オンに戻したらすぐ鳴るように）
    const suspended = make('suspended');
    suspended.synth.setEnabled(false);
    return suspended.synth.unlock().then(() => {
      expect(suspended.synth.state()).toBe('running');
      suspended.synth.setEnabled(true);
      suspended.synth.play(['extend']);
      expect(oscillators(suspended.nodes)).toHaveLength(1);
    });
  });

  it('破壊音：ノイズ 0.4 秒と、のこぎり波 120 → 30 Hz', () => {
    const { synth, nodes } = make();
    synth.play(['ufoDestroyed']);
    const [saw] = oscillators(nodes);
    expect(saw!.type).toBe('sawtooth');
    expect(saw!.frequency.calls).toEqual([
      ['set', 120, 10],
      ['exp', 30, 10.4],
    ]);
    const noise = nodes.find((n) => n.kind === 'buffer')!;
    expect([noise.started, noise.stopped]).toEqual([10, 10.4]);
  });

  it('増機音：三角波 523 → 659 → 784 Hz を 0.12 秒ずつ、最後は 0.3 秒', () => {
    const { synth, nodes } = make();
    synth.play(['extend']);
    const [tri] = oscillators(nodes);
    expect(tri!.type).toBe('triangle');
    expect(tri!.frequency.calls.map((c) => c[1])).toEqual([523, 659, 784]);
    expect(tri!.frequency.calls[2]![2]).toBeCloseTo(10.24, 9);
    expect(tri!.stopped).toBeCloseTo(10.54, 9);
  });

  it('爆発音：ノイズを低域通過フィルター 400 → 80 Hz に通し、0.8 秒で消える', () => {
    const { synth, nodes } = make();
    synth.play(['miss']);
    const filter = nodes.find((n) => n.kind === 'filter')!;
    expect(filter.type).toBe('lowpass');
    expect(filter.frequency.calls).toEqual([
      ['set', 400, 10],
      ['exp', 80, 10.8],
    ]);
    expect(oscillators(nodes)).toHaveLength(0);
  });

  it('止まっている（有効にする前）ときは鳴らさず、unlock で鳴らせるようになる。作れないときは何もしない', async () => {
    const { synth, nodes, ctx } = make('suspended');
    expect(synth.state()).toBe('suspended');
    synth.play(['ufoDestroyed', 'extend']);
    expect(oscillators(nodes)).toHaveLength(0);
    await synth.unlock();
    expect(ctx.state).toBe('running');
    expect(synth.state()).toBe('running');
    synth.play(['extend']);
    expect(oscillators(nodes)).toHaveLength(1);

    const broken = createSynthesizer(() => {
      throw new Error('no audio');
    });
    expect(broken.state()).toBe('unavailable');
    expect(() => broken.play(['miss'])).not.toThrow();
  });

  it('有効にできなかった（resume が失敗した）ときは、投げずに unavailable になり、鳴らさない', async () => {
    const fake = fakeContext('suspended');
    fake.ctx.resume = () => Promise.reject(new Error('not allowed'));
    const synth = createSynthesizer(() => fake.ctx as unknown as AudioContext);
    await expect(synth.unlock()).resolves.toBeUndefined();
    expect(synth.state()).toBe('unavailable');
    synth.play(['extend']);
    expect(oscillators(fake.nodes)).toHaveLength(0);
  });

  it('ノイズは決まった式で作る（同じ種なら同じ、-1〜1 の範囲）', () => {
    const a = noiseSamples(1000);
    expect(noiseSamples(1000)).toEqual(a);
    expect(Math.max(...a)).toBeLessThanOrEqual(1);
    expect(Math.min(...a)).toBeGreaterThanOrEqual(-1);
  });
});
