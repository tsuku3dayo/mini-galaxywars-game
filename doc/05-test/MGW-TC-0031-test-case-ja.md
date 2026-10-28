---
id: MGW-TC-0031
type: test-case
title: 60 fps で動く
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0031（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0031 60 fps で動く

* **user-story**：MGW-US-0031
* **種類**：非機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0031-01 | 1 | PC のブラウザ（Chrome）で、プレイ中に 60 fps を保つ（デバッグ表示の fps で見る） | 手動（PC） | Chrome で ?debug=1 を開いて 1 分遊び、fps が 60 前後を保つ（55 を下回り続けない） |
| MGW-TC-0031-02 | 2 | iPhone の Safari とホーム画面のアプリで、プレイ中に 60 fps を保つ | 手動（iPhone） | Safari とホーム画面のアプリで ?debug=1 を開いて 1 分遊び、fps が 60 前後を保つ |
