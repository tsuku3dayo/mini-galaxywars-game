---
id: MGW-TC-0010
type: test-case
title: 隕石が牛耕式に動く
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0010（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.2）
verified: null
---

# MGW-TC-0010 隕石が牛耕式に動く

* **user-story**：MGW-US-0010
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0010-01 | 1 | 隕石は 5 個 | 自動（単体） | `tests/unit/meteor.test.ts` |
| MGW-TC-0010-02 | 2 | 隕石は画面の端で向きを変えて 1 段下がり、最下段のあとは最上段から出てくる | 自動（単体） | `tests/unit/meteor.test.ts` |
| MGW-TC-0010-03 | 3 | 右へは 180 px/秒、左へは 120 px/秒で動く | 自動（単体） | `tests/unit/meteor.test.ts` |
| MGW-TC-0010-04 | 4 | 最下段の隕石は、発射前のミサイルの先端（y = 584）の高さを通る | 自動（単体） | `tests/unit/meteor.test.ts` |
