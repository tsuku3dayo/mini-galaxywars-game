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
  buffer: unknown = null;
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
  it('ジェット音：矩形波を 440〜880 Hz で動かし、jetOff で止める', () => {
    const { synth, nodes } = make();
    synth.play(['jetOn']);
    const [osc, lfo] = oscillators(nodes);
    expect(osc!.type).toBe('square');
    expect(osc!.frequency.value).toBe(660);
    expect(lfo!.type).toBe('sawtooth');
    expect(lfo!.frequency.value).toBeCloseTo(1 / 0.3, 9);
    // LFO の深さ 220：660 ± 220 → 440〜880 Hz
    expect(nodes.some((n) => n.kind === 'gain' && n.gain.value === 220)).toBe(true);
    // 2 回目の jetOn では重ねない
    synth.play(['jetOn']);
    expect(oscillators(nodes)).toHaveLength(2);
    synth.play(['jetOff']);
    expect(osc!.stopped).not.toBeNull();
    expect(lfo!.stopped).not.toBeNull();
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

  it('ノイズは決まった式で作る（同じ種なら同じ、-1〜1 の範囲）', () => {
    const a = noiseSamples(1000);
    expect(noiseSamples(1000)).toEqual(a);
    expect(Math.max(...a)).toBeLessThanOrEqual(1);
    expect(Math.min(...a)).toBeGreaterThanOrEqual(-1);
  });
});
