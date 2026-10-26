---
id: MGW-ADR-0003
type: architecture-decision
title: 公開先と公開の仕方（GitHub Pages・GitHub Actions）
status: stable
version: 1.1
updated: 2026-10-26
sources:
  - MGW-PB-0001（v1.2） §3
  - doc/specification.md (v1.3) §24
verified:
  by: tsuku3dayo
  at: 2026-10-26T16:06:38+09:00
---

# MGW-ADR-0003 公開先と公開の仕方

## 状況

公開先は GitHub Pages、リポジトリは公開（`tsuku3dayo/mini-galaxywars-game`）と決まっている（MGW-PB-0001 §3）。仕様書は、GitHub Actions でビルド・Lint・E2E・GitHub Pages への公開を自動にすることを求めている（§24）。

## 選択肢

1. GitHub Actions で build し、`actions/deploy-pages` で公開する。
2. `gh-pages` ブランチに build したものを push して公開する。

## 決定

選択肢 1。

- main への push（PR のマージ）で、verify と E2E が通ったときだけ公開する。
- 公開 URL は `https://tsuku3dayo.github.io/mini-galaxywars-game/`。Vite の `base` は `/mini-galaxywars-game/`。
- 試作（03）は `prototype/` に置き、`<公開 URL>/prototype/` で開けるようにする。土台（最初の WS）ができるまでは、手元のサーバーを同じネットワークの iPhone で開いてよい。
- リポジトリの設定で、Pages の公開元を「GitHub Actions」にする（最初の WS で行う）。

## 理由

- build したものをブランチに残さないので、履歴がきれいなまま。
- テストが通ったものだけが公開される。

## 影響

- main へのマージ = 公開になる。リリースに関わる PR は、そう伝えてからマージを頼む。

## 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-26 | 中身は変えない。sources の版の表記を直す（MGW-PB-0001 v1.2、仕様書 v1.2） |
