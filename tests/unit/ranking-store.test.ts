import { describe, expect, it } from 'vitest';
import {
  createRankingStore,
  finalizeName,
  normalizeName,
  RANKING_KEY,
  toLocalIso,
  type RankingEntry,
} from '../../src/storage/ranking-store';

/** localStorage のまがいもの */
class MemoryStorage implements Storage {
  private items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}

/** 呼ぶたびに 1 分ずつ進む時計 */
function clock(start = new Date(2026, 9, 28, 12, 0, 0)) {
  let t = start.getTime();
  return () => {
    const d = new Date(t);
    t += 60_000;
    return d;
  };
}

function setup() {
  const storage = new MemoryStorage();
  const store = createRankingStore(storage, clock());
  const saved = () => JSON.parse(storage.getItem(RANKING_KEY)!) as { app: string; version: number; entries: RankingEntry[] };
  return { storage, store, saved };
}

const entry = (score: number, name = 'AAA', date = '2026-10-01T10:00:00+09:00'): RankingEntry => ({ score, name, date });
const file = (entries: unknown, patch: Record<string, unknown> = {}) =>
  JSON.stringify({ app: 'mini-galaxywars', version: 1, entries, ...patch });

describe('ランキングの保存', () => {
  it('MGW-TC-0025-02 記録するのは、スコア・プレイヤー名・日時', () => {
    const { store, saved } = setup();
    expect(store.add(1250, 'haru')).toBe(1);
    const [e] = saved().entries;
    expect(Object.keys(e!).sort()).toEqual(['date', 'name', 'score']);
    expect(e!.score).toBe(1250);
    // 名前は大文字にして保存する
    expect(e!.name).toBe('HARU');
    // 日時はタイムゾーン付きの ISO 8601 で、登録した時刻を指す
    expect(e!.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    expect(Date.parse(e!.date)).toBe(new Date(2026, 9, 28, 12, 0, 0).getTime());
    expect(store.load()).toEqual(saved().entries);
  });

  it('MGW-TC-0025-03 localStorage の galaxy-wars-scores に、スコアの高い順で上位 10 件だけを残す', () => {
    const { store, saved } = setup();
    const scores = [300, 1650, 50, 900, 1250, 400, 700, 1100, 150, 600];
    for (const s of scores) store.add(s, 'P');
    expect(saved().app).toBe('mini-galaxywars');
    expect(saved().version).toBe(1);
    expect(saved().entries.map((e) => e.score)).toEqual([...scores].sort((a, b) => b - a));
    // 11 件目：入らない点数は rankOf が null。入る点数は 10 件に切られ、いちばん低いものが落ちる
    expect(store.rankOf(50)).toBeNull();
    expect(store.rankOf(800)).toBe(5);
    expect(store.add(800, 'NEW')).toBe(5);
    expect(saved().entries).toHaveLength(10);
    expect(saved().entries.map((e) => e.score)).toEqual([1650, 1250, 1100, 900, 800, 700, 600, 400, 300, 150]);
    // 同じスコアなら、先に登録した方が上
    expect(store.rankOf(900)).toBe(5);
    expect(store.add(900, 'LATER')).toBe(5);
    expect(saved().entries.slice(3, 5).map((e) => e.name)).toEqual(['P', 'LATER']);
    // 0 点は入らない
    expect(setup().store.rankOf(0)).toBeNull();
    expect(setup().store.rankOf(10)).toBe(1);
  });

  it('MGW-TC-0027-03 形の違う JSON や、ほかのアプリの JSON は読み込まず、今の記録を変えない', () => {
    const { storage, store } = setup();
    store.add(1000, 'KEEP');
    const before = storage.getItem(RANKING_KEY);

    // 正しい形は読める（並べ直して返す）
    const good = store.parseImport(file([entry(100, 'B'), entry(500, 'A')]));
    expect(good).toEqual({ ok: true, entries: [entry(500, 'A'), entry(100, 'B')] });
    // 空の記録も読める
    expect(store.parseImport(file([]))).toEqual({ ok: true, entries: [] });

    const bad = [
      'not json',
      'null',
      '[]',
      file([entry(100)], { app: 'other-app' }),
      file([entry(100)], { version: 2 }),
      file('entries'),
      file(Array.from({ length: 11 }, () => entry(100))),
      file([entry(-1)]),
      file([entry(100_000)]),
      file([entry(10.5)]),
      file([{ ...entry(100), score: '100' }]),
      file([entry(100, '')]),
      file([entry(100, 'NINECHARS')]),
      file([entry(100, 'abc')]),
      file([entry(100, 'A-B')]),
      file([entry(100, 'A', 'not a date')]),
      file([{ score: 100, name: 'A' }]),
      file([null]),
    ];
    for (const text of bad) expect(store.parseImport(text), text).toEqual({ ok: false });
    // 調べただけでは、今の記録は変わらない
    expect(storage.getItem(RANKING_KEY)).toBe(before);
  });
});

describe('ランキングの保存（そのほか）', () => {
  it('保存が無い・壊れている・形が違うときは空として扱い、保存はし直さない', () => {
    const { storage, store } = setup();
    expect(store.load()).toEqual([]);
    for (const text of ['{', file([entry(100)], { app: 'x' })]) {
      storage.setItem(RANKING_KEY, text);
      expect(store.load()).toEqual([]);
      expect(storage.getItem(RANKING_KEY)).toBe(text);
    }
    // localStorage が使えないときも空
    const blocked = new MemoryStorage();
    blocked.getItem = () => {
      throw new Error('blocked');
    };
    const broken = createRankingStore(blocked, clock());
    expect(broken.load()).toEqual([]);
  });

  it('書き出しは保存の形（2 文字の字下げ）で、読み込みの確認のあとにまるごと置き換える', () => {
    const { store, saved } = setup();
    store.add(700, 'A');
    const json = store.exportJson();
    expect(json).toBe(JSON.stringify({ app: 'mini-galaxywars', version: 1, entries: saved().entries }, null, 2));
    // 書き出したものは、そのまま読み込める
    expect(store.parseImport(json)).toEqual({ ok: true, entries: saved().entries });

    store.replaceAll([entry(100, 'X'), entry(300, 'Y')]);
    expect(saved().entries.map((e) => e.name)).toEqual(['Y', 'X']);
  });

  it('名前：入力のたびに大文字・英数字と空白だけ・8 文字まで。登録のときに空なら PLAYER', () => {
    expect(normalizeName('haru-2026!')).toBe('HARU2026');
    expect(normalizeName('abcdefghij')).toBe('ABCDEFGH');
    expect(normalizeName('a b')).toBe('A B');
    expect(normalizeName('はる')).toBe('');
    expect(finalizeName('  ab  ')).toBe('AB');
    expect(finalizeName('   ')).toBe('PLAYER');
    expect(finalizeName('はる')).toBe('PLAYER');
  });

  it('日時は端末の時刻のタイムゾーン付きの ISO 8601', () => {
    const d = new Date(2026, 0, 2, 3, 4, 5);
    const iso = toLocalIso(d);
    expect(iso.startsWith('2026-01-02T03:04:05')).toBe(true);
    expect(Date.parse(iso)).toBe(d.getTime());
  });
});
