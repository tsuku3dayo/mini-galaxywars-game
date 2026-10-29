---
id: MGW-TASK-0032
type: implementation-task
title: タイトル画面の点数の説明・ボタン、クレジットの名前、E2E の小さい端末
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0011（v1.2）
  - MGW-TD-0003（v1.6）
  - MGW-TD-0004（v1.5）
  - MGW-TD-0007（v1.5）
  - MGW-TC-0014（v1.3）
  - MGW-TC-0022（v1.0）
  - MGW-TC-0033（v1.1）
verified: null
---

# MGW-TASK-0032 タイトル画面の点数の説明・ボタン、クレジットの名前、E2E の小さい端末

* **workstream**：MGW-WS-0011
* **ブランチ**：`feat/TASK-0032-title-guide`
* **依存**：MGW-TASK-0031
* **実施記録**：attested-computation の同じ番号（0032）。作るのはこの TASK の PR

## やること

- render：点数の説明の Canvas（`score-guide.ts`。UFO の拡大・部位からの線・ドットの数字。`scoreGuideModel()`）（MGW-TD-0003 §7）
- title.ts・style.css：飾りの UFO 3 機を点数の説明と「4 機目の突起は 600」に替える。START・RANKING・SETTINGS・CREDITS・効果音を同じ大きさで縦に並べ、操作の案内の下に小さめのランキング消去。収まらないときは枠の中でスクロール。Space は中身をスクロールさせない（MGW-TD-0004 §2.1）
- credits.ts：PRODUCER・DIRECTOR・GAME DESIGNER の名前を「つくだ よしはる」に
- `playwright.config.ts`：`iphonese-webkit` を `devices['iPhone SE (3rd gen)']` に（MGW-TD-0007 §7）。小さい端末の大きさに頼る E2E を直す

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-04 | MGW-US-0014 | 5 つのボタンが同じ大きさで並び、操作の案内の下に小さめのランキング消去。iPhone 11 では枠に収まり、iPhone SE では枠の中でスクロールして全部に届く | 自動（E2E） |
| MGW-TC-0014-05 | MGW-US-0014 | 点数の説明（側面・上部 50、下部中央 100、下部突起 150）と「4 機目の突起は 600」 | 自動（単体） |
| MGW-TC-0014-06 | MGW-US-0014 | 同上 | 自動（E2E） |
| MGW-TC-0014-07 | MGW-US-0014 | 同上 | 手動（iPhone・PC） |
| MGW-TC-0022-03 | MGW-US-0022 | iPhone SE 相当の画面（第 3 世代、375 × 667）でもはみ出さない | 自動（E2E） |
| MGW-TC-0033-03 | MGW-US-0033 | 役割と名前が縦に並ぶ（PRODUCER・DIRECTOR・GAME DESIGNER は `つくだ よしはる`） | 自動（E2E） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0032、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
