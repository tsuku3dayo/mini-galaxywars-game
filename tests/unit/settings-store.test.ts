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
    store.save({ displayMode: 'pixel' });
    expect(JSON.parse(storage.getItem(SETTINGS_KEY)!)).toEqual({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel', sound: true });
    expect(store.load().displayMode).toBe('pixel');
    store.save({ displayMode: 'cellophane' });
    expect(createSettingsStore(storage).load().displayMode).toBe('cellophane');
  });

  it('無い・壊れている・形が違うときは、初めの値（擬似カラーセロハン・効果音オン）', () => {
    expect(createSettingsStore(memoryStorage()).load()).toEqual({ displayMode: 'cellophane', sound: true });
    for (const text of ['{', 'null', JSON.stringify({ app: 'other', version: 1, displayMode: 'pixel' }), JSON.stringify({ app: 'mini-galaxywars', version: 2, displayMode: 'pixel' }), JSON.stringify({ app: 'mini-galaxywars', version: 1, displayMode: 'crt' })]) {
      expect(createSettingsStore(memoryStorage(text)).load(), text).toEqual({ displayMode: 'cellophane', sound: true });
    }
    // localStorage が使えないときも
    const blocked = memoryStorage();
    blocked.getItem = () => {
      throw new Error('blocked');
    };
    expect(createSettingsStore(blocked).load()).toEqual({ displayMode: 'cellophane', sound: true });
  });

  it('MGW-TC-0034-05 設定は端末に保存され、開き直しても同じ。初めはオン。前からある設定（効果音の項目がないもの）はオンとして読み、表示方式は変わらない', () => {
    // 初めはオン
    const storage = memoryStorage();
    expect(createSettingsStore(storage).load().sound).toBe(true);
    // オフにして保存すると、開き直してもオフ。表示方式は消えない
    createSettingsStore(storage).save({ displayMode: 'pixel' });
    createSettingsStore(storage).save({ sound: false });
    expect(createSettingsStore(storage).load()).toEqual({ displayMode: 'pixel', sound: false });
    expect(JSON.parse(storage.getItem(SETTINGS_KEY)!)).toEqual({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel', sound: false });
    // 表示方式を変えても、効果音の設定は消えない
    createSettingsStore(storage).save({ displayMode: 'cellophane' });
    expect(createSettingsStore(storage).load()).toEqual({ displayMode: 'cellophane', sound: false });
    // 仕様書 v1.6 までの設定（sound がない）はオンとして読み、表示方式はそのまま
    const old = memoryStorage(JSON.stringify({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel' }));
    expect(createSettingsStore(old).load()).toEqual({ displayMode: 'pixel', sound: true });
    // true・false でない値もオン
    const odd = memoryStorage(JSON.stringify({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel', sound: 'no' }));
    expect(createSettingsStore(odd).load().sound).toBe(true);
  });
});
