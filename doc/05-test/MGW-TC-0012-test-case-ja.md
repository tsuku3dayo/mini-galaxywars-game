---
id: MGW-TC-0012
type: test-case
title: 光線をミサイルの先端で弾く
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0012（v1.0）
  - MGW-TST-0001（v1.3）
  - MGW-TD-0002（v1.5）
verified: null
---

# MGW-TC-0012 光線をミサイルの先端で弾く

* **user-story**：MGW-US-0012
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0012-01 | 1 | ミサイルの先端の中央・横幅 4 px の範囲で、正面の上から光線を受けると、ミスにならずに弾く | 自動（単体） | `tests/unit/reflect.test.ts` |
| MGW-TC-0012-02 | 2 | 弾いた光線は上へ飛び、画面の上で消える。UFO には当たらない | 自動（単体） | `tests/unit/reflect.test.ts` |
| MGW-TC-0012-03 | 3 | 4 px の範囲の外で光線を受けると、ミスになる | 自動（単体） | `tests/unit/reflect.test.ts` |
