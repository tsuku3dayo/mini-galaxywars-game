---
id: MGW-AC-0030
type: attested-computation
title: クレジット画面の確認
status: review
version: 1.0
updated: 2026-10-29
sources:
  - MGW-TASK-0030（v1.0）
  - MGW-TC-0014（v1.2）
  - MGW-TC-0033（v1.0）
verified: null
---

# MGW-AC-0030 クレジット画面の確認

* **TASK**：MGW-TASK-0030（ブランチ `feat/TASK-0030-credits`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

E2E は 3 つの project（`pc-chromium`・`iphone11-webkit`・`iphonese-webkit`）で通った。

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0014-03 | `#/title`・`#/play`・`#/ranking`・`#/credits` のハッシュで画面が切り替わる | OK | `✓` › e2e\title.spec.ts › MGW-TC-0014-03。`#/credits` でクレジット画面だけが出て（`data-screen=credits`）、タイトル・ランキング・ゲーム画面は隠れる。`#/title` に戻すと隠れる |
| MGW-TC-0033-01 | タイトル画面の「CREDITS」で `#/credits` のクレジット画面に移る | OK | `✓` › e2e\credits.spec.ts › MGW-TC-0033-01 |
| MGW-TC-0033-02 | 上に「← BACK」とタイトル「クレジット」があり、BACK でタイトルに戻る | OK | `✓` › e2e\credits.spec.ts › MGW-TC-0033-02。BACK は左、タイトルは同じ段の中央 |
| MGW-TC-0033-03 | 役割と名前が縦に並ぶ（PRODUCER・DIRECTOR・GAME DESIGNER は `YOSHIHARU TSUKUDA`、GRAPHIC DESIGNER・SOUND CREATOR・PROGRAMMER は `CLAUDE CODE`） | OK | `✓` › e2e\credits.spec.ts › MGW-TC-0033-03。6 組が上から 役割 → 名前 の順に並ぶ。役割の字は名前より小さく、名前は太字。背景は紺（`rgb(11, 16, 32)`） |

単体テストの合計：`Tests 93 passed (93)`。E2E の合計：`160 passed`、`20 skipped`。`npm run verify` も通った。

画面：iPhone 11・iPhone SE・PC（1280 × 800）で、クレジット画面と、CREDITS・ランキング消去を 1 段に並べたタイトル画面のスクリーンショットを見た。「ブロック崩しミニ」のクレジット画面と同じ並び（BACK とタイトル、うすい字の役割と太字の名前が中央に縦に並ぶ）になった。

## 2. 手動の確認（WS-0010 の終わり、2026-10-29、オーナー、iPhone 11・PC）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0033-04 | 見た目は「ブロック崩しミニ」のクレジット画面と同じ形 | OK（iPhone・PC） |

## 3. 設計と違う作りにしたこと

なし。MGW-TD-0004 v1.2・MGW-GUI-0008 v1.0 のとおり。

## 4. 確認できなかったこと

- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
