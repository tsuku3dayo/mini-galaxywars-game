---
id: MGW-US-0033
type: user-story
title: クレジットを見る
status: review
version: 1.0
updated: 2026-10-29
sources:
  - MGW-EP-0003（v1.3）
  - doc/specification.md (v1.7) §1.1、§18
verified: null
---

# MGW-US-0033 クレジットを見る

* **epic**：MGW-EP-0003
* **優先順位**：3-8
* **種類**：機能

## ストーリー

* **だれが**：プレイヤー
* **したいこと**：このアプリを作った人を見る
* **なぜ**：作り手が分かるようにするため（「ブロック崩しミニ」とそろえる）

## 受け入れ条件

| No | 条件 | 確かめ方 |
| :--- | :--- | :--- |
| 1 | タイトル画面の「CREDITS」で `#/credits` のクレジット画面に移る | E2E |
| 2 | 上に「← BACK」とタイトル「クレジット」があり、BACK でタイトルに戻る | E2E |
| 3 | 役割と名前が縦に並ぶ：PRODUCER・DIRECTOR・GAME DESIGNER は `YOSHIHARU TSUKUDA`、GRAPHIC DESIGNER・SOUND CREATOR・PROGRAMMER は `CLAUDE CODE` | E2E |
| 4 | 見た目は「ブロック崩しミニ」のクレジット画面と同じ形（紺の画面、役割は小さく薄い字、名前は太字） | 手動（iPhone・PC） |
