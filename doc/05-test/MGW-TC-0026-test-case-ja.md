---
id: MGW-TC-0026
type: test-case
title: ランキングを見る
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0026（v1.1）
  - MGW-TST-0001（v1.2）
  - MGW-TD-0006（v1.0）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0026 ランキングを見る

* **user-story**：MGW-US-0026
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0026-01 | 1 | `#/ranking` に、上位 10 件の順位・スコア・名前・日時が出る | 自動（E2E） | `e2e/ranking.spec.ts` |
| MGW-TC-0026-02 | 2 | 記録がないときは、記録がないことが分かる表示が出る | 自動（E2E） | `e2e/ranking.spec.ts` |
| MGW-TC-0026-03 | 3 | 「TITLE」でタイトルに戻る | 自動（E2E） | `e2e/ranking.spec.ts` |
