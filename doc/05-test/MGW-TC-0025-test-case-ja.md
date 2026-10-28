---
id: MGW-TC-0025
type: test-case
title: ランキングに登録する
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0025（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0006（v1.0）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0025 ランキングに登録する

* **user-story**：MGW-US-0025
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0025-01 | 1 | クリアかゲームオーバーでゲームが終わり、スコアが上位 10 件に入るとき、名前を入れて登録できる | 自動（E2E） | `e2e/ranking.spec.ts` |
| MGW-TC-0025-02 | 2 | 記録するのは、スコア・プレイヤー名・日時 | 自動（単体） | `tests/unit/ranking-store.test.ts` |
| MGW-TC-0025-03 | 3 | localStorage の `galaxy-wars-scores` に、スコアの高い順で上位 10 件だけを残す | 自動（単体） | `tests/unit/ranking-store.test.ts` |
| MGW-TC-0025-04 | 4 | ページを読み込み直しても、記録が残っている | 自動（E2E） | `e2e/ranking.spec.ts` |
