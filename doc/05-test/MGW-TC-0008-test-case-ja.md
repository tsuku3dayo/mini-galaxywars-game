---
id: MGW-TC-0008
type: test-case
title: UFO が 2 段で動く
status: stable
version: 1.1
updated: 2026-10-28
sources:
  - MGW-US-0008（v1.1）
  - MGW-TST-0001（v1.5）
  - MGW-TD-0002（v1.6）
verified: null
---

# MGW-TC-0008 UFO が 2 段で動く

* **user-story**：MGW-US-0008
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0008-01 | 1 | 上段の 4 機（y 64–88）は右へ、下段の 4 機（y 96–120）は左へ動く | 自動（単体） | `tests/unit/ufo.test.ts` |
| MGW-TC-0008-02 | 2 | 速さは残りの機数で変わる：8 機 20、7 機 25、6 機 30、5 機 35、4 機 40、3 機 45、2 機 60、1 機 80 px/秒 | 自動（単体） | `tests/unit/ufo.test.ts` |
| MGW-TC-0008-03 | 3 | UFO は 2 コマの絵を 0.25 秒ごとに切り替え、羽ばたくように見える | 自動（単体） | `tests/unit/sprites.test.ts` |
| MGW-TC-0008-04 | 3 | UFO は 2 コマの絵を 0.25 秒ごとに切り替え、羽ばたくように見える | 手動（PC） | UFO が 2 つの形を行き来して、羽ばたくように見える |
