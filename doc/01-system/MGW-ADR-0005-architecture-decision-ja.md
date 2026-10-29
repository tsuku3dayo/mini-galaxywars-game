---
id: MGW-ADR-0005
type: architecture-decision
title: アプリ識別子と保存のキー
status: stable
version: 1.1
updated: 2026-10-26
sources:
  - MGW-PB-0001（v1.3） §7
  - doc/specification.md (v1.11) §9、§21
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:06:38+09:00
---

# MGW-ADR-0005 アプリ識別子と保存のキー

## 状況

`tsuku3dayo.github.io` にはほかのアプリも載る。localStorage と Service Worker のキャッシュは、同じオリジンのアプリどうしで共有される。そのため、キーとキャッシュの名前が混ざらないようにする必要がある。
仕様書は、ランキングのキーを `galaxy-wars-scores` と決めている（§21）。

## 選択肢

1. アプリ識別子を `mini-galaxywars` にする。ランキングのキーは仕様書どおり `galaxy-wars-scores` とし、ほかのキーとキャッシュ名に識別子を付ける。
2. ランキングのキーも `mini-galaxywars:scores` にする（仕様書を変える）。

## 決定

選択肢 1（オーナーの決定、2026-10-26）。

| もの | 名前 |
| :--- | :--- |
| アプリ識別子 | `mini-galaxywars` |
| ランキング | `galaxy-wars-scores`（仕様書 §21） |
| 設定 | `mini-galaxywars-settings` |
| Service Worker のキャッシュ | `mini-galaxywars-` で始まる名前（Workbox の `cacheId: 'mini-galaxywars'`） |
| Service Worker の範囲（scope） | `/mini-galaxywars-game/` |
| バックアップの JSON | `"app": "mini-galaxywars"` を入れ、ほかのアプリの JSON を読み込まないようにする |

## 理由

- 仕様書を変えずに済む。`galaxy-wars-scores` は、ほかのアプリと重なりにくい。
- キャッシュ名と scope を分けると、ほかのアプリの Service Worker と混ざらない。

## 影響

- 保存のデータの形（版の番号を含める）は 04 で決める。

## 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-26 | 中身は変えない。sources の版の表記を直す（MGW-PB-0001 v1.2、仕様書 v1.2） |
