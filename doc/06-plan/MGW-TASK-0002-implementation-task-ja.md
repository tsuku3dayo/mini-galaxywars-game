---
id: MGW-TASK-0002
type: implementation-task
title: GitHub Pages への公開
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0001（v1.1）
  - MGW-TD-0007（v1.3）
  - MGW-TC-0001（v1.0）
verified: null
---

# MGW-TASK-0002 GitHub Pages への公開

* **workstream**：MGW-WS-0001
* **ブランチ**：`feat/TASK-0002-pages-deploy`
* **依存**：MGW-TASK-0001
* **実施記録**：attested-computation の同じ番号（0002）。作るのはこの TASK の PR

## やること

- .github/workflows/pages.yml を、verify・e2e のあとに dist/ と prototype/ を公開する形に置き換える

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0001-01 | MGW-US-0001 | main へのマージで、`https://tsuku3dayo.github.io/mini-galaxywars-game/` に公開される | 手動（CI） |
| MGW-TC-0001-03 | MGW-US-0001 | 公開 URL を PC のブラウザと iPhone の Safari で開ける | 手動（iPhone・PC） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0002、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
