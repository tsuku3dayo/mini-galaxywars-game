---
id: MGW-TC-0019
type: test-case
title: 3,000 点で発射台が増える
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0019（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.1）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0019 3,000 点で発射台が増える

* **user-story**：MGW-US-0019
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0019-01 | 1 | スコアが 3,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | 自動（単体） | `tests/unit/extend.test.ts` |
| MGW-TC-0019-02 | 1 | スコアが 3,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | 自動（E2E） | `e2e/hud.spec.ts` |
| MGW-TC-0019-03 | 2 | 増機は 1 回だけ | 自動（単体） | `tests/unit/extend.test.ts` |
| MGW-TC-0019-04 | 3 | 増えたときに増機音が鳴る（音は MGW-US-0023） | 自動（単体） | `tests/unit/extend.test.ts` |
