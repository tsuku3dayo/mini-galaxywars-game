---
id: MGW-TC-0016
type: test-case
title: ミスのあとに再登場し、残機がなくなると終わる
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0016（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0002（v1.3）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0016 ミスのあとに再登場し、残機がなくなると終わる

* **user-story**：MGW-US-0016
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0016-01 | 1 | ゲームは発射台 3 基（画面に出ている 1 基を含む）で始まる | 自動（単体） | `tests/unit/lives.test.ts` |
| MGW-TC-0016-02 | 2 | ミスすると残機が 1 減り、2 秒後に次の発射台が出て、発射前（Ready）に戻る | 自動（単体） | `tests/unit/lives.test.ts` |
| MGW-TC-0016-03 | 3 | ミスしても、倒した UFO は戻らず、隕石は動き続ける | 自動（単体） | `tests/unit/lives.test.ts` |
| MGW-TC-0016-04 | 4 | 最上部を抜けたときは、1 秒後に発射台が出て Ready に戻る。残機は減らない | 自動（単体） | `tests/unit/lives.test.ts` |
| MGW-TC-0016-05 | 5 | 残機が 0 になると、ゲームオーバーの表示が出る。そのあと、スコアが上位 10 件に入るときはランキング登録（MGW-US-0025）に進み、入らないときは「TITLE」でタイトルに戻る | 自動（単体） | `tests/unit/lives.test.ts` |
| MGW-TC-0016-06 | 5 | 残機が 0 になると、ゲームオーバーの表示が出る。そのあと、スコアが上位 10 件に入るときはランキング登録（MGW-US-0025）に進み、入らないときは「TITLE」でタイトルに戻る | 自動（E2E） | `e2e/gameplay.spec.ts` |
