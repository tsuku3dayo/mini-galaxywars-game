---
id: MGW-TC-0007
type: test-case
title: 誘導ミサイルを操る（通常上昇・加速噴射）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0007（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.1）
  - MGW-TD-0003（v1.0）
verified: null
---

# MGW-TC-0007 誘導ミサイルを操る（通常上昇・加速噴射）

* **user-story**：MGW-US-0007
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0007-01 | 1 | 噴射しないときは、上昇 180 px/秒、横 120 px/秒で動き、バックファイアを描かない | 自動（単体） | `tests/unit/missile.test.ts` |
| MGW-TC-0007-02 | 2 | 噴射中（`Space` を押し続ける・マウスのボタンを押し続ける）は、上昇 280 px/秒、横 240 px/秒になる | 自動（単体） | `tests/unit/missile.test.ts` |
| MGW-TC-0007-03 | 3 | 噴射中だけ、ミサイルの後ろにバックファイアを描く | 自動（単体） | `tests/unit/missile.test.ts` |
| MGW-TC-0007-04 | 3 | 噴射中だけ、ミサイルの後ろにバックファイアを描く | 手動（PC） | 噴射しているときだけ、ミサイルの下に炎が点滅して見える |
| MGW-TC-0007-05 | 4 | 敵や隕石に触れずに最上部（y < 48）を抜けても、ミスにならない | 自動（単体） | `tests/unit/missile.test.ts` |
