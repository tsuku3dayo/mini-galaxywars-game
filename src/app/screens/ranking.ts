// ランキング画面（MGW-GUI-0005）。一覧・記録がないとき・書き出し・読み込み・TITLE
import type { RankingEntry, RankingStore } from '../../storage/ranking-store';
import { ordinal } from './entry';

export interface RankingScreen {
  /** 記録を読み直して出す（画面に入るたびに呼ぶ） */
  refresh(): void;
}

const pad5 = (n: number) => String(n).padStart(5, '0');
const pad2 = (n: number) => String(n).padStart(2, '0');

/** 端末の時刻で YYYY-MM-DD（MGW-TD-0006 §3） */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 書き出しのファイル名 mini-galaxywars-ranking-YYYYMMDD.json（MGW-TD-0006 §1.1） */
export function exportFileName(now: Date): string {
  return `mini-galaxywars-ranking-${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}.json`;
}

function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

export function createRankingScreen(root: HTMLElement, store: RankingStore): RankingScreen {
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

  // 読み込めないときの知らせ
  const message = document.createElement('p');
  message.className = 'ranking-message';
  message.setAttribute('role', 'alert');
  message.hidden = true;

  // 書き出し：今の記録を JSON のファイルにして保存する
  const exportButton = button('書き出し', () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName(new Date());
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });

  // 読み込み：ファイルを選ぶ → 調べる → 置き換えてよいか聞く
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'application/json,.json';
  file.hidden = true;
  let pending: RankingEntry[] | null = null;
  const importButton = button('読み込み', () => {
    message.hidden = true;
    file.click();
  });
  file.addEventListener('change', async () => {
    const chosen = file.files?.[0];
    // 同じファイルをもう一度選べるように空にする
    file.value = '';
    if (!chosen) return;
    const result = store.parseImport(await chosen.text());
    if (!result.ok) {
      message.textContent = 'このファイルは読み込めません';
      message.hidden = false;
      return;
    }
    pending = result.entries;
    confirm.hidden = false;
  });

  const confirm = document.createElement('div');
  confirm.className = 'ranking-confirm';
  confirm.setAttribute('role', 'dialog');
  confirm.hidden = true;
  const question = document.createElement('p');
  question.append('今のランキングを置き換えます。', document.createElement('br'), 'よろしいですか？');
  const closeConfirm = () => {
    pending = null;
    confirm.hidden = true;
  };
  const confirmButtons = document.createElement('div');
  confirmButtons.className = 'ranking-buttons';
  confirmButtons.append(
    button('置き換える', () => {
      if (pending) store.replaceAll(pending);
      closeConfirm();
      show();
    }),
    button('やめる', closeConfirm),
  );
  confirm.append(question, confirmButtons);

  const backup = document.createElement('div');
  backup.className = 'ranking-buttons';
  backup.append(exportButton, importButton);

  const back = document.createElement('a');
  back.className = 'button';
  back.href = '#/title';
  back.textContent = 'TITLE';

  root.append(heading, table, empty, backup, message, back, file, confirm);

  function show(): void {
    const entries = store.load();
    body.replaceChildren();
    entries.forEach((e, i) => {
      const row = body.insertRow();
      for (const text of [ordinal(i + 1), pad5(e.score), e.name, formatDate(e.date)]) row.insertCell().textContent = text;
    });
    table.hidden = entries.length === 0;
    empty.hidden = entries.length > 0;
  }

  return {
    refresh() {
      message.hidden = true;
      closeConfirm();
      show();
    },
  };
}
