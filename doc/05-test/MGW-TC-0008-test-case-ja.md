---
id: MGW-TC-0008
type: test-case
title: UFO が 2 段で動く
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0008（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.1）
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
| MGW-TC-0008-02 | 2 | 速さは残りの機数で変わる：8 機 80、7 機 100、6 機 120、5 機 140、4 機 160、3 機 180、2 機 240、1 機 320 px/秒 | 自動（単体） | `tests/unit/ufo.test.ts` |
