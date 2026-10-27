---
id: MGW-AC-0010
type: attested-computation
title: タイトル画面とルーティングの確認
status: draft
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0010（v1.0）
  - MGW-TC-0014（v1.0）
verified: null
---

# MGW-AC-0010 タイトル画面とルーティングの確認

* **TASK**：MGW-TASK-0010（ブランチ `feat/TASK-0010-title-routing`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-01 | 起動すると `#/title` のタイトル画面に、アプリ名「ギャラクシーウォーズミニ」と「START」が出る | OK（3 つの project） | `✓ [pc-chromium]`・`✓ [iphone11-webkit]`・`✓ [iphonese-webkit]` › e2e\title.spec.ts › MGW-TC-0014-01。HIGH 00000・RANKING・操作の案内（PC とタッチで出し分け）・原作の表記も出て、ゲーム画面の枠の中に収まる |
| MGW-TC-0014-02 | 「START」（または `Space`）で `#/play` に移り、発射前（Ready）から始まる | OK（3 つの project。`Space` は pc-chromium） | 同じく MGW-TC-0014-02。`Space` で始めたとき、同じ `Space` で発射しないことも確かめた |
| MGW-TC-0014-03 | `#/title`・`#/play`・`#/ranking` のハッシュで画面が切り替わる | OK（3 つの project） | 同じく MGW-TC-0014-03。RANKING・TITLE のリンクでも行き来でき、知らないハッシュはタイトルになる。プレイを離れると状態はなくなる |

E2E の合計：`40 passed`、`8 skipped`。`npm run verify`（単体テスト `53 passed`）も通った。

画面：iPhone SE・iPhone 11 の幅（WebKit）と PC で、タイトル画面とランキング画面を表示して確かめた。

## 2. 手動の確認

この TASK の確認 ID には手動のものはない。

## 3. 設計と違う作りにしたこと

- タイトルの「SETTINGS」は、設定を作る MGW-TASK-0021 で足す。押しても何も起きないボタンを置かないため。
- ランキング画面は、見出し「RANKING」・「まだ記録がありません」・「TITLE」だけを作った（`#/ranking` の切り替えを確かめるため）。一覧と書き出し・読み込みは MGW-WS-0006 で足す。
- HIGH は、ランキングを作る MGW-TASK-0017 のあとでランキングの 1 位を出す。それまでは 00000。
- 「START」のときに音を有効にする（MGW-US-0024）のは、音を作る TASK で足す。
- RANKING と TITLE は、ハッシュを変えるリンク（`<a href="#/…">`）にし、見た目はボタンと同じにした。

## 4. 確認できなかったこと

なし。
