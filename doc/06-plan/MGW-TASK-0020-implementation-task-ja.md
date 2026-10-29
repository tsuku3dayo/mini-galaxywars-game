---
id: MGW-TASK-0020
type: implementation-task
title: 擬似カラーと被弾フラッシュ
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0007（v1.6）
  - MGW-TD-0003（v1.7）
  - MGW-TC-0028（v1.0）
verified: null
---

# MGW-TASK-0020 擬似カラーと被弾フラッシュ

* **workstream**：MGW-WS-0007
* **ブランチ**：`feat/TASK-0020-cellophane-flash`
* **依存**：MGW-TASK-0008
* **実施記録**：attested-computation の同じ番号（0020）。作るのはこの TASK の PR

## やること

- render/color-palette.ts

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0028-01 | MGW-US-0028 | 擬似カラーセロハンの表示では、上部（UFO 域）が紫・赤系、中央（隕石域）が透明・白系、下部（発射台域）が緑系になる | 手動（iPhone・PC） |
| MGW-TC-0028-02 | MGW-US-0028 | ミスすると、画面全体が `#FF0000`（赤）で 100 ms フラッシュする | 自動（単体） |
| MGW-TC-0028-03 | MGW-US-0028 | ミスすると、画面全体が `#FF0000`（赤）で 100 ms フラッシュする | 手動（PC） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0020、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
