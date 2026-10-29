---
id: MGW-TC-0020
type: test-case
title: 永久パターンを防ぐ
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0020（v1.0）
  - MGW-TST-0001（v1.6）
  - MGW-TD-0002（v1.7）
verified: null
---

# MGW-TC-0020 永久パターンを防ぐ

* **user-story**：MGW-US-0020
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0020-01 | 1 | UFO を 1 機も倒さないまま 90 秒たつと、残機が 1 になる | 自動（単体） | `tests/unit/idle.test.ts` |
| MGW-TC-0020-02 | 2 | そのまま 150 秒たつと、ゲームオーバーになる | 自動（単体） | `tests/unit/idle.test.ts` |
| MGW-TC-0020-03 | 3 | タイマーは UFO を倒すと 0 に戻る。ミスしても戻らない | 自動（単体） | `tests/unit/idle.test.ts` |
