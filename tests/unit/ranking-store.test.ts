import { describe, expect, it } from 'vitest';
import {
  createRankingStore,
  finalizeName,
  nameLength,
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
  it('MGW-TC-0025-02 記録するのは、スコア・プレイヤー名・日時・結果（クリアかゲームオーバー）', () => {
    const { store, saved } = setup();
    expect(store.add(1250, 'haru', 'clear')).toBe(1);
    expect(store.add(900, 'たあ', 'gameOver')).toBe(2);
    const [e, g] = saved().entries;
    expect(Object.keys(e!).sort()).toEqual(['date', 'name', 'result', 'score']);
    expect(e!.score).toBe(1250);
    // 名前は大文字に直さない（仕様書 v1.7）
    expect(e!.name).toBe('haru');
    expect(e!.result).toBe('clear');
    expect(g).toMatchObject({ name: 'たあ', result: 'gameOver' });
    // 日時はタイムゾーン付きの ISO 8601 で、登録した時刻を指す
    expect(e!.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    expect(Date.parse(e!.date)).toBe(new Date(2026, 9, 28, 12, 0, 0).getTime());
    expect(store.load()).toEqual(saved().entries);
  });

  it('MGW-TC-0025-05 名前は 1〜8 文字で、ひらがな・カタカナ・漢字・英数字を入れられる', () => {
    // 日本語・英数字・記号はそのまま。大文字には直さない
    expect(normalizeName('はる')).toBe('はる');
    expect(normalizeName('カタカナ漢字abc')).toBe('カタカナ漢字ab');
    expect(normalizeName('haru-2026!')).toBe('haru-202');
    // 8 文字は見た目の 1 文字で数える（濁点の組み合わせ・絵文字も 1 文字）
    expect(nameLength('が')).toBe(1);
    expect(nameLength('👨‍👩‍👧')).toBe(1);
    expect(normalizeName('🚀🚀🚀🚀🚀🚀🚀🚀🚀')).toBe('🚀🚀🚀🚀🚀🚀🚀🚀');
    // 改行などの制御文字は取り除く
    expect(normalizeName('は\nる\t')).toBe('はる');
    // 登録のとき：前後の空白を取り、空なら PLAYER
    expect(finalizeName('  たあ  ')).toBe('たあ');
    expect(finalizeName('　')).toBe('PLAYER');
    expect(finalizeName('')).toBe('PLAYER');
    // 日本語の名前を保存して読める
    const { store } = setup();
    store.add(500, '銀河 太郎', 'clear');
    expect(store.load()[0]!.name).toBe('銀河 太郎');
  });

  it('MGW-TC-0025-03 localStorage の galaxy-wars-scores に、スコアの高い順で上位 10 件だけを残す', () => {
    const { store, saved } = setup();
    const scores = [300, 1650, 50, 900, 1250, 400, 700, 1100, 150, 600];
    for (const s of scores) store.add(s, 'P', 'gameOver');
    expect(saved().app).toBe('mini-galaxywars');
    expect(saved().version).toBe(1);
    expect(saved().entries.map((e) => e.score)).toEqual([...scores].sort((a, b) => b - a));
    // 11 件目：入らない点数は rankOf が null。入る点数は 10 件に切られ、いちばん低いものが落ちる
    expect(store.rankOf(50)).toBeNull();
    expect(store.rankOf(800)).toBe(5);
    expect(store.add(800, 'NEW', 'clear')).toBe(5);
    expect(saved().entries).toHaveLength(10);
    expect(saved().entries.map((e) => e.score)).toEqual([1650, 1250, 1100, 900, 800, 700, 600, 400, 300, 150]);
    // 同じスコアなら、先に登録した方が上
    expect(store.rankOf(900)).toBe(5);
    expect(store.add(900, 'LATER', 'clear')).toBe(5);
    expect(saved().entries.slice(3, 5).map((e) => e.name)).toEqual(['P', 'LATER']);
    // 0 点は入らない
    expect(setup().store.rankOf(0)).toBeNull();
    expect(setup().store.rankOf(10)).toBe(1);
  });

  it('MGW-TC-0027-03 形の違う JSON や、ほかのアプリの JSON は読み込まず、今の記録を変えない', () => {
    const { storage, store } = setup();
    store.add(1000, 'KEEP', 'clear');
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
      file([entry(100, 'ここのつのもじです')]),
      file([entry(100, ' A')]),
      file([entry(100, 'A\nB')]),
      file([{ ...entry(100), name: 12 }]),
      file([{ ...entry(100), result: 'win' }]),
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
    store.add(700, 'A', 'gameOver');
    const json = store.exportJson();
    expect(json).toBe(JSON.stringify({ app: 'mini-galaxywars', version: 1, entries: saved().entries }, null, 2));
    // 書き出したものは、そのまま読み込める
    expect(store.parseImport(json)).toEqual({ ok: true, entries: saved().entries });

    store.replaceAll([entry(100, 'X'), entry(300, 'Y')]);
    expect(saved().entries.map((e) => e.name)).toEqual(['Y', 'X']);
  });

  it('MGW-TC-0027-05 「記録を読み込む」で、書き出した JSON からランキングを戻せる（日本語の名前・結果も戻る）', () => {
    const { store, saved } = setup();
    store.add(1520, 'たあ', 'clear');
    store.add(390, 'はる', 'gameOver');
    const json = store.exportJson();
    const other = setup();
    const parsed = other.store.parseImport(json);
    expect(parsed).toEqual({ ok: true, entries: saved().entries });
    if (parsed.ok) other.store.replaceAll(parsed.entries);
    expect(other.store.load().map((e) => [e.name, e.result])).toEqual([
      ['たあ', 'clear'],
      ['はる', 'gameOver'],
    ]);
  });

  it('MGW-TC-0027-06 仕様書 v1.6 までの形（英大文字の名前・結果なし）で書き出したファイルも読み込める', () => {
    const { store } = setup();
    const old = file([entry(1650, 'ABCDEFGH', '2026-10-26T12:00:00+09:00'), entry(900, 'A B', '2026-10-25T12:00:00+09:00')]);
    const parsed = store.parseImport(old);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    // result は足さない（前からの記録のまま）
    expect(parsed.entries).toEqual([entry(1650, 'ABCDEFGH', '2026-10-26T12:00:00+09:00'), entry(900, 'A B', '2026-10-25T12:00:00+09:00')]);
    expect(parsed.entries.every((e) => !('result' in e))).toBe(true);
    // 前からの記録と新しい記録が混ざっていても読める
    store.replaceAll(parsed.entries);
    store.add(1000, 'たあ', 'clear');
    expect(store.parseImport(store.exportJson()).ok).toBe(true);
    expect(store.load().map((e) => e.result ?? '-')).toEqual(['-', 'clear', '-']);
  });

  it('MGW-TC-0032-02 「消す」で全部消え、「やめる」では何も変わらない（全消去）', () => {
    const { storage, store, saved } = setup();
    store.add(1520, 'たあ', 'clear');
    store.add(390, 'はる', 'gameOver');
    // 「やめる」は消去を呼ばないので、そのまま
    expect(store.load()).toHaveLength(2);
    store.clearAll();
    expect(store.load()).toEqual([]);
    // 空の記録として保存し、HIGH（1 位）もなくなる
    expect(saved()).toEqual({ app: 'mini-galaxywars', version: 1, entries: [] });
    expect(store.rankOf(10)).toBe(1);
    // 記録がないときに消しても空のまま
    store.clearAll();
    expect(JSON.parse(storage.getItem(RANKING_KEY)!).entries).toEqual([]);
  });

  it('MGW-TC-0032-06 設定（表示方式・効果音）は消えない', () => {
    const { storage, store } = setup();
    const settings = JSON.stringify({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel', sound: false });
    storage.setItem('mini-galaxywars-settings', settings);
    store.add(500, 'A', 'clear');
    store.clearAll();
    expect(storage.getItem('mini-galaxywars-settings')).toBe(settings);
    expect(storage.length).toBe(2);
  });

  it('日時は端末の時刻のタイムゾーン付きの ISO 8601', () => {
    const d = new Date(2026, 0, 2, 3, 4, 5);
    const iso = toLocalIso(d);
    expect(iso.startsWith('2026-01-02T03:04:05')).toBe(true);
    expect(Date.parse(iso)).toBe(d.getTime());
  });
});
