---
id: MGW-TC-0002
type: test-case
title: オフラインで遊べる・ホーム画面に置ける
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-US-0002（v1.0）
  - MGW-TST-0001（v1.1）
  - MGW-TD-0007（v1.3）
verified: null
---

# MGW-TC-0002 オフラインで遊べる・ホーム画面に置ける

* **user-story**：MGW-US-0002
* **種類**：機能

## 確認 ID

自動の確認は、テストの名前の先頭に確認 ID を書く（MGW-TST-0001 §3）。手動の確認は、手順と期待する結果を書く。

| 確認 ID | 条件 No | 確かめること | 種類 | 確かめる場所・手動の手順 |
| :--- | :--- | :--- | :--- | :--- |
| MGW-TC-0002-01 | 1 | 一度開いたあと、ネットワークを切っても起動して遊べる | 自動（E2E） | `e2e/offline.spec.ts` |
| MGW-TC-0002-02 | 2 | iPhone で機内モードにして、ホーム画面のアプリから起動して遊べる | 手動（iPhone） | 一度開いたあと、機内モードにしてホーム画面のアプリを起動し、1 回遊べる |
| MGW-TC-0002-03 | 3 | 公開するファイルに外部の URL（CDN・Web フォントなど）がない | 自動（dist の検査） | `scripts/check-dist.mjs` |
| MGW-TC-0002-04 | 4 | マニフェストの `name` が「ギャラクシーウォーズミニ」で、Service Worker の範囲が `/mini-galaxywars-game/` | 自動（dist の検査） | `scripts/check-dist.mjs` |
| MGW-TC-0002-05 | 5 | iPhone のホーム画面に追加でき、アプリの名前が切れない | 手動（iPhone） | Safari の共有 →「ホーム画面に追加」。アイコンの下の名前が「GWミニ」で切れていない |
