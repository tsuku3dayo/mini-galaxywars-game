---
id: MGW-TC-0015
type: test-case
title: HUD でスコアと残機を見る
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0015（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0003（v1.0）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0015 HUD でスコアと残機を見る

* **user-story**：MGW-US-0015
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0015-01 | 1 | HUD 帯（y 0–48）に「SCORE」「HIGH」と残機が出る | 自動（E2E） | `e2e/hud.spec.ts` |
| MGW-TC-0015-02 | 2 | スコアは 5 桁のゼロ詰め（例：`00150`）で出る | 自動（単体） | `tests/unit/hud.test.ts` |
| MGW-TC-0015-03 | 3 | 残機は、ミサイルではなく発射台のアイコンの数で出る | 手動（PC） | HUD の残機が発射台の形のアイコンで並ぶ |
| MGW-TC-0015-04 | 4 | HIGH は、ランキングの 1 位のスコアと、今のスコアの大きい方 | 自動（単体） | `tests/unit/hud.test.ts` |
