---
id: MGW-TD-0006
type: technical-design
title: storage の設計（ランキング・設定・JSON）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TD-0001（v1.0）
  - MGW-ADR-0005（v1.1）
  - MGW-GUI-0004（v1.0）
  - MGW-GUI-0005（v1.0）
  - MGW-GUI-0006（v1.0）
  - MGW-US-0025（v1.0）
  - MGW-US-0026（v1.0）
  - MGW-US-0027（v1.0）
  - MGW-US-0029（v1.0）
  - doc/specification.md (v1.6) §9、§21
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
    { "score": 3550, "name": "PLAYER", "date": "2026-10-26T16:52:10+09:00" }
  ]
}
```

- `entries` はスコアの高い順、最大 10 件。同じスコアなら、先に登録した方（`date` が古い方）を上にする★。
- 書き出しの JSON も同じ形。ファイル名は `mini-galaxywars-ranking-YYYYMMDD.json`。

### 1.2 関数

`Storage`（localStorage）と、今の時刻を返す関数を外から渡す（テストで差し替えるため）。

| 関数 | 中身 |
| :--- | :--- |
| `load(): RankingEntry[]` | 読む。無い・壊れている・形が違うときは空として扱う（保存はし直さない） |
| `rankOf(score): number \| null` | 入るなら順位（1〜10）、入らないなら null。0 点は入らない |
| `add(score, name): number` | 足して並べ直し、10 件に切って保存。入った順位を返す |
| `exportJson(): string` | 今の内容を 1.1 の形で（2 文字の字下げ） |
| `parseImport(text): { ok: true; entries } \| { ok: false }` | 1.3 で調べる。今の記録は変えない |
| `replaceAll(entries)` | 読み込みの確認のあとに、まるごと置き換える |

### 1.3 読み込みの検査（MGW-US-0027）

次のどれかなら「このファイルは読み込めません」とし、今の記録は変えない。

- JSON として読めない
- `app` が `"mini-galaxywars"` でない、`version` が 1 でない
- `entries` が配列でない、11 件以上
- どれかの項目で、`score` が 0〜99,999 の整数でない、`name` が `^[A-Z0-9 ]{1,8}$` に合わない、`date` が日時として読めない

### 1.4 名前（MGW-GUI-0004）

入力のたびに大文字にし、`A-Z`・`0-9`・空白以外を取り除き、8 文字で切る。前後の空白を取って空になったら `PLAYER` にする。

## 2. 設定（`settings-store.ts`）

localStorage `mini-galaxywars-settings`：

```json
{ "app": "mini-galaxywars", "version": 1, "displayMode": "cellophane" }
```

- `displayMode` は `cellophane`（擬似カラーセロハン、初め）か `pixel`（ピクセルパーフェクト）。
- 読めないときは初めの値。選んだらすぐ保存する。

## 3. 日付の表示

ランキング画面は、端末の時刻で `YYYY-MM-DD`。保存はタイムゾーン付きの ISO 8601。

## 4. 確かめ方

- 1.2〜1.4、2 は単体テスト（`Storage` のまがいものを使う）。
- 再読み込みで残ること、書き出し・読み込みの操作は E2E。
