---
id: MGW-TC-0003
type: test-case
title: 新しい版を「更新」ボタンで受け取る
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0003（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0007（v1.3）
  - MGW-TD-0004（v1.0）
verified: null
---

# MGW-TC-0003 新しい版を「更新」ボタンで受け取る

* **user-story**：MGW-US-0003
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0003-01 | 1 | 新しい版が届くと、タイトル画面とランキング画面に「更新」ボタンが出る | 自動（E2E） | `e2e/pwa-update.spec.ts` |
| MGW-TC-0003-02 | 2 | 「更新」を押すと、新しい版に切り替わって再読み込みされる | 自動（E2E） | `e2e/pwa-update.spec.ts` |
| MGW-TC-0003-03 | 3 | プレイ中（#/play）は「更新」を出さず、版も切り替わらない | 自動（E2E） | `e2e/pwa-update.spec.ts` |
