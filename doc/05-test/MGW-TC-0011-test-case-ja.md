---
id: MGW-TC-0011
type: test-case
title: 当たり判定とミス
status: stable
version: 1.1
updated: 2026-10-28
sources:
  - MGW-US-0011（v1.1）
  - MGW-TST-0001（v1.7）
  - MGW-TD-0002（v1.7）
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
| MGW-TC-0011-04 | 3 | ミサイルが UFO に当たると、UFO が壊れ、得点が入り（得点は MGW-US-0013）、ミサイルは消える（1 回の発射で倒せるのは 1 機） | 自動（単体） | `tests/unit/collision.test.ts` |
| MGW-TC-0011-05 | 4 | ミサイルが光線に当たると、弾く範囲（MGW-US-0012）の外ならミスになる | 自動（単体） | `tests/unit/collision.test.ts` |
| MGW-TC-0011-06 | 5 | 同じステップで複数に当たったときは、隕石 → UFO → 光線の順に判定する | 自動（単体） | `tests/unit/collision.test.ts` |

## メモ

- 確認 ID の 02・03（条件 No2「発射前のミサイルの先端に隕石が触れてもミスになる」）は、仕様書 v1.6 で条件がなくなったので廃止した。番号は使い直さない。
