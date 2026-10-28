// 設定の保存（MGW-TD-0006 §2）。localStorage は外から渡す（テストで差し替えるため）

/** 表示方式。cellophane（擬似カラーセロハン、初め）か pixel（ピクセルパーフェクト） */
export type DisplayModeSetting = 'cellophane' | 'pixel';

export interface SettingsStore {
  /** 読めないときは初めの値（cellophane） */
  loadDisplayMode(): DisplayModeSetting;
  /** 選んだらすぐ保存する */
  saveDisplayMode(mode: DisplayModeSetting): void;
}

export const SETTINGS_KEY = 'mini-galaxywars-settings';
const APP = 'mini-galaxywars';
const VERSION = 1;
export const DEFAULT_DISPLAY_MODE: DisplayModeSetting = 'cellophane';

export function createSettingsStore(storage: Storage): SettingsStore {
  return {
    loadDisplayMode() {
      try {
        const data = JSON.parse(storage.getItem(SETTINGS_KEY) ?? 'null') as Record<string, unknown> | null;
        if (data?.app === APP && data.version === VERSION && (data.displayMode === 'cellophane' || data.displayMode === 'pixel')) {
          return data.displayMode;
        }
      } catch {
        // 壊れている・使えないときは初めの値
      }
      return DEFAULT_DISPLAY_MODE;
    },
    saveDisplayMode(mode) {
      storage.setItem(SETTINGS_KEY, JSON.stringify({ app: APP, version: VERSION, displayMode: mode }));
    },
  };
}
