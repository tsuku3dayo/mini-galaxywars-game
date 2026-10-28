---
id: MGW-TASK-0021
type: implementation-task
title: 表示方式の設定
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0007（v1.2）
  - MGW-TD-0003（v1.1）
  - MGW-TD-0006（v1.0）
  - MGW-TC-0029（v1.0）
verified: null
---

# MGW-TASK-0021 表示方式の設定

* **workstream**：MGW-WS-0007
* **ブランチ**：`feat/TASK-0021-display-settings`
* **依存**：MGW-TASK-0020
* **実施記録**：attested-computation の同じ番号（0021）。作るのはこの TASK の PR

## やること

- storage/settings-store.ts、app/screens/settings.ts（MGW-GUI-0006）、ピクセルパーフェクト

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0029-01 | MGW-US-0029 | 設定で「擬似カラーセロハン」と「ピクセルパーフェクト」を切り替えられる | 自動（E2E） |
| MGW-TC-0029-02 | MGW-US-0029 | ピクセルパーフェクトでは、セロハンの色を重ねず、拡大してもドットがぼやけない | 手動（PC） |
| MGW-TC-0029-03 | MGW-US-0029 | 選んだ方式は `mini-galaxywars-settings` に残り、次に開いても同じ方式になる | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0021、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
