---
id: MGW-US-0022
type: user-story
title: iPhone の画面に収まる
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-EP-0004（v1.0）
  - doc/specification.md (v1.6) §1.2、§2
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:22:35+09:00
---

# MGW-US-0022 iPhone の画面に収まる

* **epic**：MGW-EP-0004
* **優先順位**：4-2
* **種類**：機能

## ストーリー

* **だれが**：iPhone のプレイヤー
* **したいこと**：iPhone の縦画面で、はみ出さずに遊ぶ
* **なぜ**：小さな画面でも全体を見て遊べるようにするため

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | iPhone の縦画面で、フィールドと操作空間が 1 画面に収まり、3:4 の比率を保つ | E2E・手動（iPhone） |
| 2 | iPhone SE 相当の画面でもはみ出さない | E2E |
| 3 | ノッチ・ホームバー・ステータスバーに中身が入り込まない（Safari とホーム画面のアプリの両方） | 手動（iPhone） |
| 4 | 遊んでいる間に、画面のスクロール・拡大・長押しのメニューが起きない | 手動（iPhone） |
