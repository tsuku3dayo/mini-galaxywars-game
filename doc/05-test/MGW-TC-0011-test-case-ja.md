---
id: MGW-TC-0011
type: test-case
title: 当たり判定とミス
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0011（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.0）
verified: null
---

# MGW-TC-0011 当たり判定とミス

* **user-story**：MGW-US-0011
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0011-01 | 1 | ミサイルが隕石に触れるとミスになり、爆発を描く | 自動（単体） | `tests/unit/collision.test.ts` |
| MGW-TC-0011-02 | 2 | 発射前のミサイルの先端に隕石が触れてもミスになる | 自動（単体） | `tests/unit/collision.test.ts` |
| MGW-TC-0011-03 | 2 | 発射前のミサイルの先端に隕石が触れてもミスになる | 自動（E2E） | `e2e/gameplay.spec.ts` |
| MGW-TC-0011-04 | 3 | ミサイルが UFO に当たると、UFO が壊れ、得点が入る（得点は MGW-US-0013） | 自動（単体） | `tests/unit/collision.test.ts` |
| MGW-TC-0011-05 | 4 | ミサイルが光線に当たると、弾く範囲（MGW-US-0012）の外ならミスになる | 自動（単体） | `tests/unit/collision.test.ts` |
| MGW-TC-0011-06 | 5 | 同じステップで複数に当たったときは、隕石 → UFO → 光線の順に判定する | 自動（単体） | `tests/unit/collision.test.ts` |
