---
id: MGW-US-0001
type: user-story
title: 公開 URL で開ける
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-EP-0001（v1.0）
  - doc/specification.md (v1.8) §13〜§15、§24
  - MGW-ADR-0003（v1.1）
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:22:35+09:00
---

# MGW-US-0001 公開 URL で開ける

* **epic**：MGW-EP-0001
* **優先順位**：1-1
* **種類**：機能

## ストーリー

* **だれが**：プレイヤー
* **したいこと**：公開 URL を開くだけで遊べる
* **なぜ**：インストールや登録なしで、すぐ試せるようにするため

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | main へのマージで、`https://tsuku3dayo.github.io/mini-galaxywars-game/` に公開される | CI |
| 2 | PR では verify と E2E が CI で動き、失敗するとマージの前に分かる | CI |
| 3 | 公開 URL を PC のブラウザと iPhone の Safari で開ける | 手動（iPhone・PC） |
