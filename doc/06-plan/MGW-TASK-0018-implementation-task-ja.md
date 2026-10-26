---
id: MGW-TASK-0018
type: implementation-task
title: 名前の入力とランキング画面
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-WS-0006（v1.0）
  - MGW-TD-0004（v1.0）
  - MGW-TD-0006（v1.0）
  - MGW-TC-0016（v1.0）
  - MGW-TC-0017（v1.0）
  - MGW-TC-0025（v1.0）
  - MGW-TC-0026（v1.0）
verified: null
---

# MGW-TASK-0018 名前の入力とランキング画面

* **workstream**：MGW-WS-0006
* **ブランチ**：`feat/TASK-0018-entry-ranking-screen`
* **依存**：MGW-TASK-0011、MGW-TASK-0017
* **実施記録**：attested-computation の同じ番号（0018）。作るのはこの TASK の PR

## やること

- app/screens/entry.ts（MGW-GUI-0004）、ranking.ts（MGW-GUI-0005 の一覧）
- クリア・ゲームオーバーのあとの登録への流れ

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0016-06 | MGW-US-0016 | 残機が 0 になると、ゲームオーバーの表示が出る。そのあと、スコアが上位 10 件に入るときはランキング登録（MGW-US-0025）に進み、入らないときは「TITLE」でタイトルに戻る | 自動（E2E） |
| MGW-TC-0017-03 | MGW-US-0017 | クリアのあと、スコアが上位 10 件に入るときはランキング登録（MGW-US-0025）に進み、入らないときは「TITLE」でタイトルに戻る | 自動（E2E） |
| MGW-TC-0025-01 | MGW-US-0025 | クリアかゲームオーバーでゲームが終わり、スコアが上位 10 件に入るとき、名前を入れて登録できる | 自動（E2E） |
| MGW-TC-0025-04 | MGW-US-0025 | ページを読み込み直しても、記録が残っている | 自動（E2E） |
| MGW-TC-0026-01 | MGW-US-0026 | `#/ranking` に、上位 10 件の順位・スコア・名前・日時が出る | 自動（E2E） |
| MGW-TC-0026-02 | MGW-US-0026 | 記録がないときは、記録がないことが分かる表示が出る | 自動（E2E） |
| MGW-TC-0026-03 | MGW-US-0026 | 「TITLE」でタイトルに戻る | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0018、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
