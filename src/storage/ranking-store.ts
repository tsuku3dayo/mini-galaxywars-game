// ランキングの保存（MGW-TD-0006 §1）。localStorage と今の時刻は外から渡す（テストで差し替えるため）

export interface RankingEntry {
  score: number;
  name: string;
  /** タイムゾーン付きの ISO 8601（例：2026-10-26T16:52:10+09:00） */
  date: string;
}

export type ImportResult = { ok: true; entries: RankingEntry[] } | { ok: false };

export interface RankingStore {
  /** 無い・壊れている・形が違うときは空。保存はし直さない */
  load(): RankingEntry[];
  /** 入るなら順位（1〜10）、入らないなら null。0 点は入らない */
  rankOf(score: number): number | null;
  /** 足して並べ直し、10 件に切って保存する。入った順位を返す（入らないときは rankOf が null なので呼ばない） */
  add(score: number, name: string): number;
  /** 今の内容を保存の形で（2 文字の字下げ） */
  exportJson(): string;
  /** 読み込む JSON を調べる。今の記録は変えない */
  parseImport(text: string): ImportResult;
  /** 読み込みの確認のあとに、まるごと置き換える */
  replaceAll(entries: RankingEntry[]): void;
}

export const RANKING_KEY = 'galaxy-wars-scores';
export const RANKING_APP = 'mini-galaxywars';
export const RANKING_VERSION = 1;
export const RANKING_SIZE = 10;
export const DEFAULT_NAME = 'PLAYER';
const NAME_MAX = 8;
const SCORE_MAX = 99_999;
const NAME_RE = /^[A-Z0-9 ]{1,8}$/;

/** 入力のたびに：大文字にし、A-Z・0-9・空白以外を取り除き、8 文字で切る（MGW-TD-0006 §1.4） */
export function normalizeName(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .slice(0, NAME_MAX);
}

/** 登録するとき：前後の空白を取り、空なら PLAYER */
export function finalizeName(input: string): string {
  const name = normalizeName(input).trim();
  return name === '' ? DEFAULT_NAME : name;
}

/** 端末の時刻のタイムゾーン付きの ISO 8601 */
export function toLocalIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

function isEntry(e: unknown): e is RankingEntry {
  if (typeof e !== 'object' || e === null) return false;
  const { score, name, date } = e as Record<string, unknown>;
  return (
    Number.isInteger(score) &&
    (score as number) >= 0 &&
    (score as number) <= SCORE_MAX &&
    typeof name === 'string' &&
    NAME_RE.test(name) &&
    typeof date === 'string' &&
    !Number.isNaN(Date.parse(date))
  );
}

/** 保存の形を調べる（MGW-TD-0006 §1.3）。合わなければ null */
function parseRanking(text: string | null): RankingEntry[] | null {
  if (text === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const { app, version, entries } = data as Record<string, unknown>;
  if (app !== RANKING_APP || version !== RANKING_VERSION) return null;
  if (!Array.isArray(entries) || entries.length > RANKING_SIZE) return null;
  if (!entries.every(isEntry)) return null;
  return entries.map(({ score, name, date }) => ({ score, name, date }));
}

/** スコアの高い順。同じスコアなら、先に登録した方（date が古い方）を上にする */
function sortEntries(entries: RankingEntry[]): RankingEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || Date.parse(a.date) - Date.parse(b.date));
}

function toJson(entries: RankingEntry[]): string {
  return JSON.stringify({ app: RANKING_APP, version: RANKING_VERSION, entries }, null, 2);
}

export function createRankingStore(storage: Storage, now: () => Date): RankingStore {
  const load = (): RankingEntry[] => {
    let text: string | null;
    try {
      text = storage.getItem(RANKING_KEY);
    } catch {
      return [];
    }
    return sortEntries(parseRanking(text) ?? []);
  };
  const save = (entries: RankingEntry[]) => storage.setItem(RANKING_KEY, toJson(entries));

  return {
    load,
    rankOf(score) {
      if (score <= 0) return null;
      // 同じスコアは先に登録した方が上なので、新しい記録はその下に入る
      const rank = load().filter((e) => e.score >= score).length + 1;
      return rank <= RANKING_SIZE ? rank : null;
    },
    add(score, name) {
      const entry: RankingEntry = { score, name: finalizeName(name), date: toLocalIso(now()) };
      const entries = sortEntries([...load(), entry]);
      save(entries.slice(0, RANKING_SIZE));
      return entries.indexOf(entry) + 1;
    },
    exportJson: () => toJson(load()),
    parseImport(text) {
      const entries = parseRanking(text);
      return entries === null ? { ok: false } : { ok: true, entries: sortEntries(entries) };
    },
    replaceAll(entries) {
      save(sortEntries(entries).slice(0, RANKING_SIZE));
    },
  };
}
