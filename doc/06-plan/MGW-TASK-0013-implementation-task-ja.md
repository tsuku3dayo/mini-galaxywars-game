---
id: MGW-TASK-0013
type: implementation-task
title: タッチ操作と操作空間
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0004（v1.3）
  - MGW-TD-0004（v1.1）
  - MGW-TC-0021（v1.1）
verified: null
---

# MGW-TASK-0013 タッチ操作と操作空間

* **workstream**：MGW-WS-0004
* **ブランチ**：`feat/TASK-0013-touch-input`
* **依存**：MGW-TASK-0012
* **実施記録**：attested-computation の同じ番号（0013）。作るのはこの TASK の PR

## やること

- input.ts：ポインター（なぞる・離して発射・触れ続けて噴射）
- 操作空間（MGW-GUI-0003）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0021-01 | MGW-US-0021 | タッチ端末では、フィールドの下に高さ 96 の操作空間が出る | 自動（E2E） |
| MGW-TC-0021-02 | MGW-US-0021 | 操作空間かプレイ空間をなぞると、発射台（発射後はミサイル）が指の x を追う | 自動（E2E） |
| MGW-TC-0021-03 | MGW-US-0021 | 操作空間かプレイ空間をタップすると発射する | 自動（E2E） |
| MGW-TC-0021-04 | MGW-US-0021 | 指を触れ続けている間は、加速噴射になる | 自動（E2E） |
| MGW-TC-0021-05 | MGW-US-0021 | 操作空間で操作するとき、指でミサイル・UFO・光線が隠れない | 手動（iPhone） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0013、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
