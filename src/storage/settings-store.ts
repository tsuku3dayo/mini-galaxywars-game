// 設定の保存（MGW-TD-0006 §2）。localStorage は外から渡す（テストで差し替えるため）

/** 表示方式。cellophane（擬似カラーセロハン、初め）か pixel（ピクセルパーフェクト） */
export type DisplayModeSetting = 'cellophane' | 'pixel';

export interface Settings {
  displayMode: DisplayModeSetting;
  /** 効果音のオン・オフ（仕様書 v1.7。初めはオン） */
  sound: boolean;
}

export interface SettingsStore {
  /** 読めないときは初めの値。sound がない前からの設定はオンとして読み、表示方式はそのまま使う */
  load(): Settings;
  /** 今の値に重ねて保存する（どちらか一方を変えても、もう一方は消えない） */
  save(patch: Partial<Settings>): void;
}

export const SETTINGS_KEY = 'mini-galaxywars-settings';
const APP = 'mini-galaxywars';
const VERSION = 1;
export const DEFAULT_DISPLAY_MODE: DisplayModeSetting = 'cellophane';
export const DEFAULT_SETTINGS: Settings = { displayMode: DEFAULT_DISPLAY_MODE, sound: true };

export function createSettingsStore(storage: Storage): SettingsStore {
  const load = (): Settings => {
    try {
      const data = JSON.parse(storage.getItem(SETTINGS_KEY) ?? 'null') as Record<string, unknown> | null;
      if (data?.app === APP && data.version === VERSION) {
        return {
          displayMode: data.displayMode === 'cellophane' || data.displayMode === 'pixel' ? data.displayMode : DEFAULT_DISPLAY_MODE,
          sound: typeof data.sound === 'boolean' ? data.sound : true,
        };
      }
    } catch {
      // 壊れている・使えないときは初めの値
    }
    return { ...DEFAULT_SETTINGS };
  };
  return {
    load,
    save(patch) {
      storage.setItem(SETTINGS_KEY, JSON.stringify({ app: APP, version: VERSION, ...load(), ...patch }));
    },
  };
}
