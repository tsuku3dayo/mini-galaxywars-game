// ランキング画面（MGW-GUI-0005）。書き出し・読み込みは MGW-TASK-0019 で足す
import type { RankingEntry } from '../../storage/ranking-store';
import { ordinal } from './entry';

export interface RankingScreen {
  /** 記録を出し直す（画面に入るたびに呼ぶ） */
  refresh(entries: RankingEntry[]): void;
}

const pad5 = (n: number) => String(n).padStart(5, '0');
const pad2 = (n: number) => String(n).padStart(2, '0');

/** 端末の時刻で YYYY-MM-DD（MGW-TD-0006 §3） */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function createRankingScreen(root: HTMLElement): RankingScreen {
  root.replaceChildren();

  const heading = document.createElement('h2');
  heading.textContent = 'RANKING';

  const table = document.createElement('table');
  table.className = 'ranking-table';
  const head = table.createTHead().insertRow();
  for (const text of ['RANK', 'SCORE', 'NAME', 'DATE']) {
    const th = document.createElement('th');
    th.textContent = text;
    head.append(th);
  }
  const body = table.createTBody();

  const empty = document.createElement('p');
  empty.textContent = 'まだ記録がありません';

  const back = document.createElement('a');
  back.className = 'button';
  back.href = '#/title';
  back.textContent = 'TITLE';

  root.append(heading, table, empty, back);

  return {
    refresh(entries) {
      body.replaceChildren();
      entries.forEach((e, i) => {
        const row = body.insertRow();
        for (const text of [ordinal(i + 1), pad5(e.score), e.name, formatDate(e.date)]) row.insertCell().textContent = text;
      });
      table.hidden = entries.length === 0;
      empty.hidden = entries.length > 0;
    },
  };
}
