---
id: MGW-AC-0021
type: attested-computation
title: 表示方式の設定の確認
status: draft
version: 1.0
updated: 2026-10-28
sources:
  - MGW-TASK-0021（v1.0）
  - MGW-TC-0029（v1.0）
verified: null
---

# MGW-AC-0021 表示方式の設定の確認

* **TASK**：MGW-TASK-0021（ブランチ `feat/TASK-0021-display-settings`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

E2E は 3 つの project（`pc-chromium`・`iphone11-webkit`・`iphonese-webkit`）で通った。

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0029-01 | 設定で「擬似カラーセロハン」と「ピクセルパーフェクト」を切り替えられる | OK | `✓` › e2e\settings.spec.ts › MGW-TC-0029-01。初めは `data-display-mode=cellophane` で、HUD の文字は紫・赤系（赤 > 200、緑 < 128）。タイトルの「SETTINGS」で設定が出て（`data-overlay=settings`）、「擬似カラーセロハン」に印。「ピクセルパーフェクト」を選ぶと `pixel` になり、プレイの HUD の文字は白（赤・緑・青とも > 200）。設定を開いている間は Space でゲームを始めない。「閉じる」で消え、セロハンにも戻せる |
| MGW-TC-0029-03 | 選んだ方式は `mini-galaxywars-settings` に残り、次に開いても同じ方式になる | OK | `✓` › e2e\settings.spec.ts › MGW-TC-0029-03。選ぶとすぐ `{ app: "mini-galaxywars", version: 1, displayMode: "pixel" }` が保存され、読み込み直しても `pixel` で、設定を開くと「ピクセルパーフェクト」に印 |

そのほか：`tests/unit/settings-store.test.ts` で、保存の形と、無い・壊れている・形が違う・localStorage が使えないときは初めの値（擬似カラーセロハン）になることを確かめた（MGW-TD-0006 §2）。

単体テストの合計：`Tests 81 passed (81)`。E2E の合計：`121 passed`、`17 skipped`。`npm run verify` も通った。

画面：iPhone SE の幅で、タイトル（START・RANKING・SETTINGS）、設定、ピクセルパーフェクトのプレイ画面のスクリーンショットを見た。iPhone（WebKit）の標準のラジオボタンは、黒い背景で選んでいない方が白く塗られて見え、どちらを選んでいるか分かりにくかったので、丸を CSS で描くようにした（選んだ方だけ中が白い）。

## 2. 手動の確認

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0029-02 | ピクセルパーフェクトで、色が重ならず、拡大したドットがぼやけない | 未実施（WS の終わりに確かめる） |

## 3. 設計と違う作りにしたこと

なし。MGW-GUI-0006 §1・MGW-TD-0006 §2 のとおり。

- 設定を開いている間は、タイトルの Space でゲームを始めない（ラジオボタンを Space で選べるように）。
- 保存に失敗しても、そのときは選んだ方式で描く。
- Canvas の `image-rendering: pixelated` と `imageSmoothingEnabled = false` は、前の TASK からどちらの方式でも付けている。ピクセルパーフェクトでは、セロハンの帯を重ねないだけ。

## 4. 確認できなかったこと

- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
