---
id: MGW-TC-0029
type: test-case
title: 表示方式を切り替える
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0029（v1.0）
  - MGW-TST-0001（v1.6）
  - MGW-TD-0003（v1.7）
  - MGW-TD-0006（v1.2）
verified: null
---

# MGW-TC-0029 表示方式を切り替える

* **user-story**：MGW-US-0029
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0029-01 | 1 | 設定で「擬似カラーセロハン」と「ピクセルパーフェクト」を切り替えられる | 自動（E2E） | `e2e/settings.spec.ts` |
| MGW-TC-0029-02 | 2 | ピクセルパーフェクトでは、セロハンの色を重ねず、拡大してもドットがぼやけない | 手動（PC） | ピクセルパーフェクトで、色が重ならず、拡大したドットがぼやけない |
| MGW-TC-0029-03 | 3 | 選んだ方式は `mini-galaxywars-settings` に残り、次に開いても同じ方式になる | 自動（E2E） | `e2e/settings.spec.ts` |
