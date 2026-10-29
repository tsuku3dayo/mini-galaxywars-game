---
id: MGW-TD-0006
type: technical-design
title: storage の設計（ランキング・設定・JSON）
status: stable
version: 1.1
updated: 2026-10-29
sources:
  - MGW-TD-0001（v1.1）
  - MGW-ADR-0005（v1.1）
  - MGW-GUI-0004（v1.1）
  - MGW-GUI-0005（v1.2）
  - MGW-GUI-0006（v1.0）
  - MGW-US-0025（v1.2）
  - MGW-US-0026（v1.2）
  - MGW-US-0027（v1.2）
  - MGW-US-0029（v1.0）
  - MGW-US-0032（v1.0）
  - MGW-US-0034（v1.0）
  - doc/specification.md (v1.9) §9、§21
  - doc/requests/2026-10-26-spec-1.4-design-values.md
verified: null
---

# MGW-TD-0006 storage の設計

## 1. ランキング（`ranking-store.ts`）

### 1.1 保存の形（localStorage `galaxy-wars-scores`）★

```json
{
  "app": "mini-galaxywars",
  "version": 1,
  "entries": [
    { "score": 3550, "name": "はる", "date": "2026-10-26T16:52:10+09:00", "result": "clear" }
  ]
}
```

- `entries` はスコアの高い順、最大 10 件。同じスコアなら、先に登録した方（`date` が古い方）を上にする★。
- `result` は `"clear"` か `"gameOver"`（仕様書 v1.7）。前からの記録にはないので、なくてもよい（`version` は 1 のまま）。読んだ記録に `result` がなければ、そのまま（足さない）。
- 書き出しの JSON も同じ形。ファイル名は `mini-galaxywars-ranking-YYYYMMDD.json`。

### 1.2 関数

`Storage`（localStorage）と、今の時刻を返す関数を外から渡す（テストで差し替えるため）。

| 関数 | 中身 |
| :--- | :--- |
| `load(): RankingEntry[]` | 読む。無い・壊れている・形が違うときは空として扱う（保存はし直さない） |
| `rankOf(score): number \| null` | 入るなら順位（1〜10）、入らないなら null。0 点は入らない |
| `add(score, name, result): number` | 足して並べ直し、10 件に切って保存。入った順位を返す。`result` は `'clear'`・`'gameOver'` |
| `exportJson(): string` | 今の内容を 1.1 の形で（2 文字の字下げ） |
| `parseImport(text): { ok: true; entries } \| { ok: false }` | 1.3 で調べる。今の記録は変えない |
| `replaceAll(entries)` | 読み込みの確認のあとに、まるごと置き換える |
| `clearAll()` | 全消去（仕様書 v1.7）。`entries: []` で保存する。設定（§2）には触れない |

### 1.3 読み込みの検査（MGW-US-0027）

次のどれかなら「このファイルは読み込めません」とし、今の記録は変えない。

- JSON として読めない
- `app` が `"mini-galaxywars"` でない、`version` が 1 でない
- `entries` が配列でない、11 件以上
- どれかの項目で、`score` が 0〜99,999 の整数でない、`name` が 1.4 の決まりに合わない、`date` が日時として読めない、`result` があるのに `"clear"`・`"gameOver"` でない

前の形（英大文字の名前・`result` なし）のファイルは、この検査に通る（MGW-US-0027）。

### 1.4 名前（MGW-GUI-0004。仕様書 v1.7）

- 文字の数は、書記素（見た目の 1 文字。`Intl.Segmenter` で数える。使えなければコードポイントの数）で数える。絵文字や濁点の組み合わせを 1 文字にするため。
- 保存できる名前：1〜8 文字、制御文字（`\p{Cc}`）を含まない、前後に空白がない。
- 入力のたび（`input`）：制御文字を取り除き、8 文字で切る。大文字には直さない。ただし、日本語の変換の途中（`compositionstart` から `compositionend` まで、`isComposing`）は何もしない。`compositionend` のあとに同じ直しをする。
- 登録のとき：前後の空白を取って空になったら `PLAYER` にする。
- 入力欄の `maxLength` は付けない（変換の途中で切れてしまうため）。8 文字は上の直しで守る。

## 2. 設定（`settings-store.ts`）

localStorage `mini-galaxywars-settings`：

```json
{ "app": "mini-galaxywars", "version": 1, "displayMode": "cellophane", "sound": true }
```

- `displayMode` は `cellophane`（擬似カラーセロハン、初め）か `pixel`（ピクセルパーフェクト）。
- `sound` は効果音のオン（`true`、初め）・オフ（`false`）（仕様書 v1.7）。ないとき・`true`/`false` でないときはオンとして読み、`displayMode` はそのまま使う。
- 関数は `load(): { displayMode, sound }` と `save(patch)`（今の値に重ねて保存）にする。どちらか一方を変えても、もう一方は消えない。
- 読めないときは初めの値。選んだらすぐ保存する。

## 3. 日付の表示

ランキング画面は、端末の時刻で `YYYY/MM/DD HH:MM`（仕様書 v1.7。前は `YYYY-MM-DD`）。スコアは 3 けたごとにカンマ（`1,520`）。保存はタイムゾーン付きの ISO 8601。

## 4. 確かめ方

- 1.2〜1.4、2 は単体テスト（`Storage` のまがいものを使う）。
- 再読み込みで残ること、書き出し・読み込みの操作、全消去は E2E。
- 日本語の変換の途中で文字が消えないことは、E2E（`compositionstart`・`compositionend` を起こす）と手動（iPhone）。

## 5. 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-29 | 仕様書 v1.7：§1.1 の `result`、§1.2 の `add` の結果と `clearAll`、§1.3・§1.4 の名前（日本語・書記素で数える・変換の途中は削らない）、§2 の `sound`、§3 の日時の形 |
