---
id: MGW-GUI-0005
type: gui-design
title: ランキング画面（書き出し・読み込み）
status: review
version: 1.0
updated: 2026-10-26
sources:
  - MGW-GUI-0001（v1.0）
  - MGW-US-0026（v1.0）
  - MGW-US-0027（v1.0）
  - doc/specification.md (v1.3) §9、§18
verified: null
---

# MGW-GUI-0005 ランキング画面（`#/ranking`）

## 1. 配置

```
┌────────────────────────────────┐
│           RANKING              │
│                                │
│ RANK SCORE NAME     DATE       │
│  1ST 03550 ABCDEFGH 2026-10-26 │
│  2ND 02100 PLAYER   2026-10-25 │
│  ...                           │
│ 10TH 00350 GALAXY   2026-10-01 │
│                                │
│   [ 書き出し ]  [ 読み込み ]     │
│                                │
│          [ TITLE ]             │
└────────────────────────────────┘
```

## 2. 部品

| 部品 | 文言 | 動き | US |
| :--- | :--- | :--- | :--- |
| 見出し | RANKING | — | MGW-US-0026 |
| 一覧 | `RANK` `SCORE` `NAME` `DATE` の 4 列、10 行 | 名前は 8 文字まで出す（切らない）。日付は `YYYY-MM-DD` | MGW-US-0026 |
| 記録がないとき | まだ記録がありません | 一覧の代わりに出す | MGW-US-0026 |
| 書き出し | 書き出し | `mini-galaxywars-ranking-YYYYMMDD.json` を保存する | MGW-US-0027 |
| 読み込み | 読み込み | ファイルを選ぶ → 「今のランキングを置き換えます。よろしいですか？」→「置き換える」「やめる」 | MGW-US-0027 |
| 読み込めないとき | このファイルは読み込めません | 今の記録は変えない | MGW-US-0027 |
| 戻る | TITLE | `#/title` へ | MGW-US-0026 |
| 更新の案内 | MGW-GUI-0007 | 新しい版があるときだけ | MGW-US-0003 |
