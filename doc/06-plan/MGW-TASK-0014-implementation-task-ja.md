---
id: MGW-TASK-0014
type: implementation-task
title: iPhone の大きさ・安全領域・60 fps
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0004（v1.4）
  - MGW-TD-0004（v1.3）
  - MGW-TD-0007（v1.5）
  - MGW-TC-0022（v1.0）
  - MGW-TC-0031（v1.0）
verified: null
---

# MGW-TASK-0014 iPhone の大きさ・安全領域・60 fps

* **workstream**：MGW-WS-0004
* **ブランチ**：`feat/TASK-0014-iphone-layout`
* **依存**：MGW-TASK-0013
* **実施記録**：attested-computation の同じ番号（0014）。作るのはこの TASK の PR

## やること

- layout.ts の安全領域・スクロールを 0 に戻す・iPhone SE
- iPhone での fps の確認

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0022-01 | MGW-US-0022 | iPhone の縦画面で、フィールドと操作空間が 1 画面に収まり、3:4 の比率を保つ | 自動（E2E） |
| MGW-TC-0022-02 | MGW-US-0022 | iPhone の縦画面で、フィールドと操作空間が 1 画面に収まり、3:4 の比率を保つ | 手動（iPhone） |
| MGW-TC-0022-03 | MGW-US-0022 | iPhone SE 相当の画面でもはみ出さない | 自動（E2E） |
| MGW-TC-0022-04 | MGW-US-0022 | ノッチ・ホームバー・ステータスバーに中身が入り込まない（Safari とホーム画面のアプリの両方） | 手動（iPhone） |
| MGW-TC-0022-05 | MGW-US-0022 | 遊んでいる間に、画面のスクロール・拡大・長押しのメニューが起きない | 手動（iPhone） |
| MGW-TC-0031-01 | MGW-US-0031 | PC のブラウザ（Chrome）で、プレイ中に 60 fps を保つ（デバッグ表示の fps で見る） | 手動（PC） |
| MGW-TC-0031-02 | MGW-US-0031 | iPhone の Safari とホーム画面のアプリで、プレイ中に 60 fps を保つ | 手動（iPhone） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0014、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
