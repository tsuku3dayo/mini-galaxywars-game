---
id: MGW-TC-0013
type: test-case
title: 当てた部位で得点が変わる
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0013（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.2）
verified: null
---

# MGW-TC-0013 当てた部位で得点が変わる

* **user-story**：MGW-US-0013
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0013-01 | 1 | 側面・上部は 50 点、下部中央は 100 点、下部の突起（2 か所）は 150 点 | 自動（単体） | `tests/unit/scoring.test.ts` |
| MGW-TC-0013-02 | 2 | 3 機を倒したあと、4 機目の突起に当てると 600 点 | 自動（単体） | `tests/unit/scoring.test.ts` |
| MGW-TC-0013-03 | 3 | 4 機目でも、突起以外に当てたときは通常の得点 | 自動（単体） | `tests/unit/scoring.test.ts` |
