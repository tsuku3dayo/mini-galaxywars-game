---
id: MGW-WS-0001
type: workstream
title: 土台（公開・PWA）
status: stable
version: 1.3
updated: 2026-10-29
sources:
  - MGW-EP-0001（v1.0）
  - MGW-TST-0001（v1.3）
verified: null
---

# MGW-WS-0001 土台（公開・PWA）

* **epic**：MGW-EP-0001
* **実施の順**：1 / 10（最初、次：MGW-WS-0002）

## ねらい

プロジェクトの骨組み・CI・GitHub Pages への公開・PWA・起動の復旧を作る。以後の WS は、マージのたびに公開 URL で確かめられる。

## user-story

MGW-US-0001、MGW-US-0002、MGW-US-0003、MGW-US-0004

## TASK（この順に行う）

| 順 | TASK | 内容 | 依存 |
| :--- | :--- | :--- | :--- |
| 1 | MGW-TASK-0001 | プロジェクトの骨組みと CI | なし |
| 2 | MGW-TASK-0002 | GitHub Pages への公開 | MGW-TASK-0001 |
| 3 | MGW-TASK-0003 | PWA（マニフェスト・オフライン・「更新」ボタン） | MGW-TASK-0002 |
| 4 | MGW-TASK-0004 | 起動の復旧（boot.js） | MGW-TASK-0003 |

## WS の終わりの手動テスト

公開 URL で、次の手動の確認 ID を確かめる（手順は各 test-case と MGW-TST-0001 §6）：MGW-TC-0001-01、MGW-TC-0001-02、MGW-TC-0001-03、MGW-TC-0002-02、MGW-TC-0002-05
