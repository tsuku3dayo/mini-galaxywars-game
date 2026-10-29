---
id: MGW-TC-0033
type: test-case
title: クレジットを見る
status: stable
version: 1.1
updated: 2026-10-29
sources:
  - MGW-US-0033（v1.1）
  - MGW-TST-0001（v1.7）
  - MGW-TD-0004（v1.7）
verified: null
---

# MGW-TC-0033 クレジットを見る

* **user-story**：MGW-US-0033
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0033-01 | 1 | タイトル画面の「CREDITS」で `#/credits` のクレジット画面に移る | 自動（E2E） | `e2e/credits.spec.ts` |
| MGW-TC-0033-02 | 2 | 上に「← BACK」とタイトル「クレジット」があり、BACK でタイトルに戻る | 自動（E2E） | `e2e/credits.spec.ts` |
| MGW-TC-0033-03 | 3 | 役割と名前が縦に並ぶ：PRODUCER・DIRECTOR・GAME DESIGNER は `つくだ よしはる`、GRAPHIC DESIGNER・SOUND CREATOR・PROGRAMMER は `CLAUDE CODE` | 自動（E2E） | `e2e/credits.spec.ts` |
| MGW-TC-0033-04 | 4 | 見た目は「ブロック崩しミニ」のクレジット画面と同じ形（紺の画面、役割は小さく薄い字、名前は太字） | 手動（iPhone・PC） | クレジット画面が「ブロック崩しミニ」と同じ形（紺の画面、BACK とタイトル、うすい字の役割と太字の名前が中央に縦に並ぶ）に見える |
