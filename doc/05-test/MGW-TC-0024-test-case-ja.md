---
id: MGW-TC-0024
type: test-case
title: iPhone で音を鳴らせる
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0024（v1.0）
  - MGW-TST-0001（v1.6）
  - MGW-TD-0004（v1.6）
  - MGW-TD-0005（v1.2）
verified: null
---

# MGW-TC-0024 iPhone で音を鳴らせる

* **user-story**：MGW-US-0024
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0024-01 | 1 | iPhone で、最初のタッチ（「START」など）のあとから音が鳴る | 手動（iPhone） | 消音スイッチを切った iPhone で「START」をタッチし、そのあとの効果音が聞こえる |
| MGW-TC-0024-02 | 2 | 音が鳴らせない状態でも、ゲームは止まらずに動く | 自動（E2E） | `e2e/audio.spec.ts` |
