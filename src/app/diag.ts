// 一時的な診断の表示（WS-0001 の手動テストで、iPhone のホーム画面のアプリに「更新」の案内が出なかったため）
// 原因を直したら、このファイルと呼び出し・vite.config.ts の __BUILD_ID__ を消す
declare const __BUILD_ID__: string;

const STORAGE_KEY = 'mgw-diag-log';
const MAX_LINES = 14;

let box: HTMLElement | null = null;
let lines: string[] = [];

function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 記録を 1 行足す（閉じても残るように localStorage にも書く） */
export function diag(message: string): void {
  lines = [...lines, `${now()} ${message}`].slice(-MAX_LINES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // 書けなくても表示は続ける
  }
  render();
}

function render(): void {
  if (box) box.textContent = lines.join('\n');
}

function swState(sw: ServiceWorker | null | undefined): string {
  return sw ? sw.state : '-';
}

/** 登録の今の状態を 1 行で書く */
export function diagRegistration(label: string, registration: ServiceWorkerRegistration): void {
  diag(`${label} active=${swState(registration.active)} waiting=${swState(registration.waiting)} installing=${swState(registration.installing)}`);
}

export function setupDiag(): void {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(saved)) lines = saved.filter((s): s is string => typeof s === 'string');
  } catch {
    lines = [];
  }
  box = document.createElement('pre');
  box.id = 'diag';
  document.body.appendChild(box);

  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  const controlled = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
  diag(`起動 build=${__BUILD_ID__} standalone=${standalone ? 'yes' : 'no'} sw=${controlled ? 'yes' : 'no'} online=${navigator.onLine ? 'yes' : 'no'}`);
}
