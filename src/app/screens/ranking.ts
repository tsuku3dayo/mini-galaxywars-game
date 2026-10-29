// ランキング画面（MGW-GUI-0005）。「ブロック崩しミニ」と同じ形の紺の画面：BACK とタイトル・一覧・記録のバックアップ
import type { RankingEntry, RankingStore } from '../../storage/ranking-store';
import { icon } from '../icons';

export interface RankingScreen {
  /** 記録を読み直して出す（画面に入るたびに呼ぶ）。mine は今登録した記録の順位（目立たせる）。ほかから開いたときは null */
  refresh(mine?: number | null): void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** 端末の時刻で YYYY/MM/DD HH:MM（MGW-TD-0006 §3） */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** 3 けたごとにカンマ（1,520） */
export function formatScore(score: number): string {
  return String(score).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 1〜3 位は 1st・2nd・3rd、4 位からは数字 */
export function rankLabel(rank: number): string {
  return rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : String(rank);
}

/** 名前の下の行：結果とクリアのタイムと日時（結果やタイムのない前からの記録は、あるものだけ） */
export function metaText(entry: RankingEntry): string {
  const date = formatDate(entry.date);
  if (entry.result === 'clear') return entry.time === undefined ? `CLEAR · ${date}` : `CLEAR · ${(entry.time / 1000).toFixed(1)} 秒 · ${date}`;
  if (entry.result === 'gameOver') return `GAME OVER · ${date}`;
  return date;
}

/** 書き出しのファイル名 mini-galaxywars-ranking-YYYYMMDD.json（MGW-TD-0006 §1.1） */
export function exportFileName(now: Date): string {
  return `mini-galaxywars-ranking-${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}.json`;
}

function button(label: string, onClick: () => void, iconName?: Parameters<typeof icon>[0]): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  if (iconName) b.prepend(icon(iconName));
  b.addEventListener('click', () => {
    onClick();
    b.blur();
  });
  return b;
}

export function createRankingScreen(root: HTMLElement, store: RankingStore): RankingScreen {
  root.replaceChildren();
  root.classList.add('navy');

  // 上に残る BACK とタイトル
  const header = document.createElement('header');
  header.className = 'navy-header';
  const back = document.createElement('a');
  back.className = 'back-button';
  back.href = '#/title';
  back.append(icon('back'), 'BACK');
  const heading = document.createElement('h2');
  heading.textContent = 'ハイスコアランキング';
  header.append(back, heading);

  // 一覧から下は、枠の中でスクロールする
  const scroll = document.createElement('div');
  scroll.className = 'navy-scroll';

  const table = document.createElement('table');
  table.className = 'ranking-table';
  const head = table.createTHead().insertRow();
  for (const text of ['順位', '名前', 'スコア']) {
    const th = document.createElement('th');
    th.textContent = text;
    head.append(th);
  }
  const body = table.createTBody();

  const empty = document.createElement('p');
  empty.className = 'ranking-empty';
  empty.textContent = 'まだ記録がありません';

  // 読み込めないときの知らせ
  const message = document.createElement('p');
  message.className = 'ranking-message';
  message.setAttribute('role', 'alert');
  message.hidden = true;

  // 書き出し：今の記録を JSON のファイルにして保存する
  const exportButton = button(
    '記録を書き出す',
    () => {
      const blob = new Blob([store.exportJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFileName(new Date());
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    'download',
  );

  // 読み込み：ファイルを選ぶ → 調べる → 置き換えてよいか聞く
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'application/json,.json';
  file.hidden = true;
  let pending: RankingEntry[] | null = null;
  const importButton = button(
    '記録を読み込む',
    () => {
      message.hidden = true;
      file.click();
    },
    'upload',
  );
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
      show(null);
    }),
    button('やめる', closeConfirm),
  );
  confirm.append(question, confirmButtons);

  // 記録のバックアップの枠
  const backup = document.createElement('section');
  backup.className = 'ranking-backup';
  const backupHeading = document.createElement('h3');
  backupHeading.textContent = '記録のバックアップ';
  const backupButtons = document.createElement('div');
  backupButtons.className = 'ranking-buttons';
  backupButtons.append(exportButton, importButton);
  backup.append(backupHeading, backupButtons, message);

  scroll.append(table, empty, backup);
  root.append(header, scroll, file, confirm);

  function show(mine: number | null): void {
    const entries = store.load();
    body.replaceChildren();
    entries.forEach((e, i) => {
      const rank = i + 1;
      const row = body.insertRow();
      row.className = rank <= 3 ? 'top' : '';
      if (rank === mine) row.classList.add('mine');
      row.insertCell().textContent = rankLabel(rank);
      const nameCell = row.insertCell();
      const name = document.createElement('div');
      name.className = 'ranking-name';
      name.textContent = rank === mine ? `${e.name}（あなた）` : e.name;
      const meta = document.createElement('div');
      meta.className = 'ranking-meta';
      if (e.result) meta.append(icon(e.result === 'clear' ? 'check' : 'cross'));
      meta.append(metaText(e));
      nameCell.append(name, meta);
      row.insertCell().textContent = formatScore(e.score);
    });
    table.hidden = entries.length === 0;
    empty.hidden = entries.length > 0;
    scroll.scrollTop = 0;
    // 今登録した記録が下の方なら、見える所までスクロールする
    body.querySelector('tr.mine')?.scrollIntoView({ block: 'nearest' });
  }

  return {
    refresh(mine = null) {
      message.hidden = true;
      closeConfirm();
      show(mine);
    },
  };
}
