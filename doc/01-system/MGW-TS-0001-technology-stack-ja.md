---
id: MGW-TS-0001
type: technology-stack
title: 技術スタック
status: review
version: 1.0
updated: 2026-10-26
sources:
  - MGW-PB-0001（v1.1） §3
  - doc/specification.md (v1.1) §13〜§15、§22〜§24
verified: null
---

# 技術スタック

版は 2026-10-26 に npm で確かめた最新。`package.json` では下の範囲で指定し、`package-lock.json` で固定する。

## 1. 実行時（ブラウザで動くもの）

| 用途 | 技術 | 仕様書 |
| :--- | :--- | :--- |
| 描画 | HTML5 Canvas 2D | §14 |
| 音 | Web Audio API（オシレーターとノイズを直接合成。音のファイルは使わない） | §14、§22 |
| 入力 | Pointer Events、KeyboardEvent | §20 |
| 保存 | localStorage | §21 |
| オフライン | Service Worker（vite-plugin-pwa が Workbox で作る）、workbox-window（更新ボタン） | §23 |

実行時に読み込む外部のライブラリは workbox-window だけ（ビルドで同梱する）。

## 2. 開発の道具

| 用途 | パッケージ | 版の範囲 | 備考 |
| :--- | :--- | :--- | :--- |
| 実行環境 | Node.js | 24 系 | §13。CI も 24 |
| パッケージ管理 | npm | Node 24 に付属 | §13 |
| ビルド | vite | ^8.3.4 | §13。最新 8.3.5 |
| 言語 | typescript | ~6.0.3 | §13。7 系は使わない（MGW-ADR-0006） |
| PWA | vite-plugin-pwa | ^2.0.0 | Vite 8 に対応 |
| PWA（更新） | workbox-window | ^7.4.1 | |
| 単体テスト | vitest | ^5.0.5 | §14。Vite 8 に対応 |
| E2E | @playwright/test | ^1.64.1 | §14。Chromium（PC）・WebKit（iPhone の画面サイズ） |
| Lint | eslint、@eslint/js、typescript-eslint | ^10.13.0、^10.0.1、^8.72.0 | typescript-eslint は TypeScript `<6.1.0` まで対応 |

## 3. npm のスクリプト

| スクリプト | 中身 |
| :--- | :--- |
| `dev` | `vite` |
| `build` | `tsc --noEmit && vite build`（§15） |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `test` | `vitest run`（§15） |
| `test:e2e` | `playwright test`（§15） |
| `check:docs` | 成果物の整合性チェック（scripts/check-docs.mjs） |
| `check:dist` | dist の検査（外部 URL がない、base パスが `/mini-galaxywars-game/`、Service Worker とマニフェストがある） |
| `verify` | `lint` → `test` → `build` → `check:dist` → `check:docs` |

## 4. CI・公開（GitHub Actions）

| きっかけ | ジョブ |
| :--- | :--- |
| PR | verify、E2E |
| main への push（マージ） | verify、E2E、build したものを GitHub Pages に公開（actions/deploy-pages） |

作るのは最初の WS（土台）。今の CI は check:docs だけ。

## 5. 使わないもの

| もの | 理由 |
| :--- | :--- |
| ゲームエンジン・UI フレームワーク（Phaser・React など） | Canvas 2D の直書きで足りる。決定性のある物理を自分で持つため |
| 外部 CDN・Web フォント | 完全オフライン（§25） |
| 音のファイル | Web Audio で合成する（§22） |
| サーバー・BaaS | サーバー通信を行わない（§1.2） |
| TypeScript 7 系 | MGW-ADR-0006 |
