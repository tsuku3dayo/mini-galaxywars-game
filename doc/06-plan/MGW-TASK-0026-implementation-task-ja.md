---
id: MGW-TASK-0026
type: implementation-task
title: 名前「銀河戦争ミニ」とタイトル画面
status: stable
version: 1.0
updated: 2026-10-28
sources:
  - MGW-WS-0009（v1.0）
  - MGW-TD-0007（v1.4）
  - MGW-TC-0002（v1.1）
  - MGW-TC-0014（v1.1）
verified: null
---

# MGW-TASK-0026 名前「銀河戦争ミニ」とタイトル画面

* **workstream**：MGW-WS-0009
* **ブランチ**：`feat/TASK-0026-app-name`
* **依存**：MGW-TASK-0021
* **実施記録**：attested-computation の同じ番号（0026）。作るのはこの TASK の PR

## やること

- vite.config.ts（マニフェストの `name`・`short_name`）、index.html（`<title>`・`apple-mobile-web-app-title`）、scripts/check-dist.mjs
- app/screens/title.ts：名前を「銀河戦争ミニ」に、原作の表記を消す

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0002-04 | MGW-US-0002 | マニフェストの `name` が「銀河戦争ミニ」で、Service Worker の範囲が `/mini-galaxywars-game/` | 自動（dist の検査） |
| MGW-TC-0002-05 | MGW-US-0002 | iPhone のホーム画面に追加でき、アプリの名前が切れない | 手動（iPhone） |
| MGW-TC-0014-01 | MGW-US-0014 | 起動すると `#/title` のタイトル画面に、アプリ名「銀河戦争ミニ」と「START」が出る | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0026、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
