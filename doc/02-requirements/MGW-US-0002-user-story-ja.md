---
id: MGW-US-0002
type: user-story
title: オフラインで遊べる・ホーム画面に置ける
status: review
version: 1.1
updated: 2026-10-28
sources:
  - MGW-EP-0001（v1.0）
  - doc/specification.md (v1.6) §1.2、§10、§23、§25
  - MGW-ADR-0004（v1.1）
  - MGW-ADR-0005（v1.1）
  - MGW-ADR-0007（v1.2）
verified: null
---

# MGW-US-0002 オフラインで遊べる・ホーム画面に置ける

* **epic**：MGW-EP-0001
* **優先順位**：1-2
* **種類**：機能

## ストーリー

* **だれが**：iPhone のプレイヤー
* **したいこと**：一度開いたあとは、電波がなくても遊べ、ホーム画面から起動できる
* **なぜ**：外でも、通信を気にせず遊べるようにするため

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | 一度開いたあと、ネットワークを切っても起動して遊べる | E2E |
| 2 | iPhone で機内モードにして、ホーム画面のアプリから起動して遊べる | 手動（iPhone） |
| 3 | 公開するファイルに外部の URL（CDN・Web フォントなど）がない | check:dist |
| 4 | マニフェストの `name` が「銀河戦争ミニ」で、Service Worker の範囲が `/mini-galaxywars-game/` | check:dist |
| 5 | iPhone のホーム画面に追加でき、アプリの名前が切れない | 手動（iPhone） |

## メモ

- ホーム画面の短い名前（`short_name`）は 03 で決める。
