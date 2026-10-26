---
id: MGW-US-0031
type: user-story
title: 60 fps で動く
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-EP-0004（v1.0）
  - doc/specification.md (v1.3) §10
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:22:35+09:00
---

# MGW-US-0031 60 fps で動く

* **epic**：MGW-EP-0004
* **優先順位**：4-3
* **種類**：非機能

## ストーリー

* **だれが**：プレイヤー
* **したいこと**：なめらかな動きで遊ぶ
* **なぜ**：ミサイルを細かく操れるようにするため

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | PC のブラウザ（Chrome）で、プレイ中に 60 fps を保つ（デバッグ表示の fps で見る） | 手動（PC） |
| 2 | iPhone の Safari とホーム画面のアプリで、プレイ中に 60 fps を保つ | 手動（iPhone） |

## メモ

- デバッグ表示（?debug=1 など）は 04 で設計する。
