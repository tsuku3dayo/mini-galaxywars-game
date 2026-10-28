import { describe, expect, it } from 'vitest';
import { createSettingsStore, SETTINGS_KEY } from '../../src/storage/settings-store';

/** localStorage のまがいもの（使う関数だけ） */
function memoryStorage(initial?: string): Storage {
  const items = new Map<string, string>(initial === undefined ? [] : [[SETTINGS_KEY, initial]]);
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (k) => items.get(k) ?? null,
    key: (i) => [...items.keys()][i] ?? null,
    removeItem: (k) => void items.delete(k),
    setItem: (k, v) => void items.set(k, v),
  };
}

describe('設定の保存', () => {
  it('選んだ表示方式を mini-galaxywars-settings に保存し、読み直せる', () => {
    const storage = memoryStorage();
    const store = createSettingsStore(storage);
    store.saveDisplayMode('pixel');
    expect(JSON.parse(storage.getItem(SETTINGS_KEY)!)).toEqual({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel' });
    expect(store.loadDisplayMode()).toBe('pixel');
    store.saveDisplayMode('cellophane');
    expect(createSettingsStore(storage).loadDisplayMode()).toBe('cellophane');
  });

  it('無い・壊れている・形が違うときは、初めの値（擬似カラーセロハン）', () => {
    expect(createSettingsStore(memoryStorage()).loadDisplayMode()).toBe('cellophane');
    for (const text of ['{', 'null', JSON.stringify({ app: 'other', version: 1, displayMode: 'pixel' }), JSON.stringify({ app: 'mini-galaxywars', version: 2, displayMode: 'pixel' }), JSON.stringify({ app: 'mini-galaxywars', version: 1, displayMode: 'crt' })]) {
      expect(createSettingsStore(memoryStorage(text)).loadDisplayMode(), text).toBe('cellophane');
    }
    // localStorage が使えないときも
    const blocked = memoryStorage();
    blocked.getItem = () => {
      throw new Error('blocked');
    };
    expect(createSettingsStore(blocked).loadDisplayMode()).toBe('cellophane');
  });
});
