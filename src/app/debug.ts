// テスト用の入口（MGW-TD-0004 §6）
export type DataKey = 'screen' | 'overlay' | 'status' | 'score' | 'high' | 'lives' | 'displayMode' | 'touch' | 'update' | 'audio';

/** body の data 属性（いつも付ける） */
export function setData(key: DataKey, value: string | number): void {
  document.body.dataset[key] = String(value);
}

export const isDebug = new URLSearchParams(location.search).get('debug') === '1';

export interface DebugApi {
  simulateUpdate?: () => void;
}

/** `?debug=1` のときだけ window.__mgw に関数を足す */
export function exposeDebug(api: DebugApi): void {
  if (!isDebug) return;
  const w = window as unknown as { __mgw?: DebugApi };
  w.__mgw = { ...w.__mgw, ...api };
}
