---
id: MGW-TC-0006
type: test-case
title: 発射台を動かしてミサイルを発射する
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0006（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0002（v1.3）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0006 発射台を動かしてミサイルを発射する

* **user-story**：MGW-US-0006
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0006-01 | 1 | 発射前、ミサイルは発射台の上（中心 y = 596、先端 y = 584）に乗っている | 自動（単体） | `tests/unit/launcher.test.ts` |
| MGW-TC-0006-02 | 2 | `←` `→`・`A` `D`・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる | 自動（単体） | `tests/unit/launcher.test.ts` |
| MGW-TC-0006-03 | 2 | `←` `→`・`A` `D`・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる | 自動（E2E） | `e2e/pc-controls.spec.ts` |
| MGW-TC-0006-04 | 3 | `Space` かクリックで発射し、ミサイルが上昇を始める | 自動（単体） | `tests/unit/launcher.test.ts` |
| MGW-TC-0006-05 | 3 | `Space` かクリックで発射し、ミサイルが上昇を始める | 自動（E2E） | `e2e/pc-controls.spec.ts` |
| MGW-TC-0006-06 | 4 | 発射台は幅 48 × 高さ 16、ミサイルは幅 12 × 高さ 24 | 自動（単体） | `tests/unit/launcher.test.ts` |
