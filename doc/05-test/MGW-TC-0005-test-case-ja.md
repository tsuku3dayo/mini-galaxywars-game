---
id: MGW-TC-0005
type: test-case
title: フィールドが仕様書の比率で表示される
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0005（v1.0）
  - MGW-TST-0001（v1.0）
  - MGW-TD-0002（v1.1）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0005 フィールドが仕様書の比率で表示される

* **user-story**：MGW-US-0005
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0005-01 | 1 | 論理座標 480 × 640 で計算し、画面には縦横比 3:4 を保って拡大・縮小して表示する | 自動（E2E） | `e2e/layout.spec.ts` |
| MGW-TC-0005-02 | 2 | 領域が HUD 帯 0–48、UFO 通過領域 48–120、隕石往復領域 120–580、発射台待機領域 580–612 になっている | 自動（単体） | `tests/unit/layout.test.ts` |
