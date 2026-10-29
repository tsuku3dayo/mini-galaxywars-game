---
id: MGW-TC-0017
type: test-case
title: 1 面をクリアする
status: stable
version: 1.1
updated: 2026-10-29
sources:
  - MGW-US-0017（v1.1）
  - MGW-TST-0001（v1.7）
  - MGW-TD-0002（v1.7）
  - MGW-TD-0004（v1.7）
verified: null
---

# MGW-TC-0017 1 面をクリアする

* **user-story**：MGW-US-0017
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0017-01 | 1 | UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる | 自動（単体） | `tests/unit/clear.test.ts` |
| MGW-TC-0017-02 | 1 | UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる | 自動（E2E） | `e2e/gameplay.spec.ts` |
| MGW-TC-0017-03 | 2 | クリアのあと、スコアが上位 10 件に入るときはランキング登録（MGW-US-0025）に進み、入らないときは「TITLE」でタイトルに戻る | 自動（E2E） | `e2e/gameplay.spec.ts` |
| MGW-TC-0017-04 | 3 | クリアの表示の下に、UFO の得点・タイム（小数第 1 位で切り捨て）・時間ボーナス・合計が出る。ゲームオーバーでは出ない | 自動（E2E） | `e2e/gameplay.spec.ts` |
| MGW-TC-0017-05 | 3 | クリアの表示の下に、UFO の得点・タイム（小数第 1 位で切り捨て）・時間ボーナス・合計が出る。ゲームオーバーでは出ない | 手動（iPhone・PC） | クリアすると、GOOD!!・STAGE CLEAR の下に UFO・TIME・BONUS・TOTAL の 4 行が読める大きさで出る。ゲームオーバーでは出ない |
