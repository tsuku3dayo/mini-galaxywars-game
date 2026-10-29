---
id: MGW-TASK-0030
type: implementation-task
title: クレジット画面
status: stable
version: 1.0
updated: 2026-10-29
sources:
  - MGW-WS-0010（v1.0）
  - MGW-TD-0004（v1.2）
  - MGW-TC-0014（v1.2）
  - MGW-TC-0033（v1.0）
verified: null
---

# MGW-TASK-0030 クレジット画面

* **workstream**：MGW-WS-0010
* **ブランチ**：`feat/TASK-0030-credits`
* **依存**：MGW-TASK-0029
* **実施記録**：attested-computation の同じ番号（0030）。作るのはこの TASK の PR

## やること

- router.ts：`#/credits`
- screens/credits.ts：「ブロック崩しミニ」と同じ形のクレジット画面（MGW-GUI-0008）
- タイトル画面の「CREDITS」ボタン（MGW-GUI-0002）

## 対象の確認 ID

| 確認 ID | user-story | 確かめること | 種類 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-03 | MGW-US-0014 | `#/title`・`#/play`・`#/ranking`・`#/credits` のハッシュで画面が切り替わる | 自動（E2E） |
| MGW-TC-0033-01 | MGW-US-0033 | タイトル画面の「CREDITS」で `#/credits` のクレジット画面に移る | 自動（E2E） |
| MGW-TC-0033-02 | MGW-US-0033 | 上に「← BACK」とタイトル「クレジット」があり、BACK でタイトルに戻る | 自動（E2E） |
| MGW-TC-0033-03 | MGW-US-0033 | 役割と名前が縦に並ぶ（PRODUCER・DIRECTOR・GAME DESIGNER は `YOSHIHARU TSUKUDA`、GRAPHIC DESIGNER・SOUND CREATOR・PROGRAMMER は `CLAUDE CODE`） | 自動（E2E） |
| MGW-TC-0033-04 | MGW-US-0033 | 見た目は「ブロック崩しミニ」のクレジット画面と同じ形 | 手動（iPhone・PC） |

## 終わりの条件

- 自動の確認 ID のテスト（名前の先頭に確認 ID）が通る。`npm run verify` と `npm run test:e2e` が手元と CI で通る。
- 画面に関わる変更は、スマートフォンの幅で表示して確かめた。
- attested-computation（番号 0030、draft）に自動テストの結果を書き、同じ PR に入れた。手動の確認 ID は、WS の終わりの手動テストで書く。
