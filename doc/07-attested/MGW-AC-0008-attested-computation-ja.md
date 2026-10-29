---
id: MGW-AC-0008
type: attested-computation
title: 描画と PC でのプレイ画面の確認
status: stable
version: 1.0
updated: 2026-10-27
sources:
  - MGW-TASK-0008（v1.0）
  - MGW-TC-0005（v1.1）
  - MGW-TC-0006（v1.1）
  - MGW-TC-0007（v1.1）
  - MGW-TC-0009（v1.2）
  - MGW-TC-0011（v1.1）
  - MGW-TC-0030（v1.1）
verified:
  by: tsuku3dayo
  at: 2026-10-27T14:36:24+09:00
---

# MGW-AC-0008 描画と PC でのプレイ画面の確認

* **TASK**：MGW-TASK-0008（ブランチ `feat/TASK-0008-render-pc-play`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1（Chromium・WebKit）

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0005-01 | 論理座標 480 × 640 で計算し、画面には縦横比 3:4 を保って拡大・縮小して表示する | OK（3 つの project） | `✓ [pc-chromium]`・`✓ [iphone11-webkit]`・`✓ [iphonese-webkit]` › e2e\layout.spec.ts › MGW-TC-0005-01。Canvas の表示と画素がどちらも 3:4、上のバーの下・左右の中央に置かれ、はみ出さない。窓の大きさを変えても合わせ直す。計算（`computeLayout`）は `tests/unit/app-layout.test.ts` でも確かめた（PC・iPhone 11 のホーム画面のアプリ・iPhone SE） |
| MGW-TC-0006-03 | `←` `→`・`A` `D`・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる | OK（pc-chromium） | `✓ [pc-chromium] › e2e\pc-controls.spec.ts › MGW-TC-0006-03 …`。iPhone の 2 つの project は PC の操作がないので飛ばした（タッチは MGW-TASK-0013） |
| MGW-TC-0006-05 | `Space` かクリックで発射し、ミサイルが上昇を始める | OK（pc-chromium） | 同じく MGW-TC-0006-05 |
| MGW-TC-0011-03 | 発射前のミサイルの先端に隕石が触れてもミスになる | OK（3 つの project） | `✓` › e2e\gameplay.spec.ts › MGW-TC-0011-03。`?debug=1` の `__mgw` で隕石を置いて 1 ステップ進め、`data-status=respawn`・`data-lives=2` になる |

そのほか：`tests/unit/sprites.test.ts` で、ドット絵の大きさ（MGW-TC-0006-06 の発射台・ミサイルを含む）、UFO の絵が部位の四角とそろうこと、フォントの 45 文字が 5 × 7 であることを確かめた（MGW-TD-0003 §6）。

単体テストの合計：`Tests 40 passed (40)`。E2E の合計：`31 passed`、`8 skipped`。新しい 3 つの spec を `--repeat-each=3` で動かして `24 passed`（毎回同じ結果）。`npm run verify` も通った。

画面：PC（1280 × 800）と iPhone 11 の幅（WebKit）で、プレイ画面（UFO・隕石・光線の波・発射台・ミサイル・爆発・デバッグ表示）を表示して確かめた。

## 2. 手動の確認（WS-0002 の終わり、2026-10-27、オーナー、PC・iPhone 11）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0007-04 | 噴射しているときだけ、ミサイルの下に炎が点滅して見える | OK（PC、公開 URL の `#/play`。`Space`・マウスのボタンを押し続けると炎が点滅し、離すと消えた） |
| MGW-TC-0009-05 | 光線が波の形で揺れて見える | OK（PC） |
| MGW-TC-0030-05 | iPhone の実機で、ゲームの時間と実際の時間がずれない（デバッグ表示で、1 秒あたり 120 ステップ） | OK（iPhone 11 の Safari、`?debug=1#/play` を 1 分）。`steps/s 119.9〜120.1`。最初は表示の数え方のずれで 120〜122 と出たので、表示を直して（PR #24）確かめ直した（§3） |

- 版の切り替え：PR #23 をマージする前に、PC と iPhone（ホーム画面の本物の「GWミニ」）で前の版を開いておいた。公開のあと、どちらも「新しい版があります」が出て、「更新」で切り替わった。

## 3. 設計と違う作りにしたこと

- この TASK では、次のものはまだ作っていない（それぞれの TASK で足す）。
  - HUD（MGW-TASK-0011）
  - 擬似カラーと被弾フラッシュ（MGW-TASK-0020）
  - タッチの操作空間（MGW-TASK-0013。それまでは、タッチ端末でも操作空間のぶんを空けない）
  - 一時停止の `P`・`Esc`・Pause（MGW-TASK-0012）
  - タイトル画面の START（MGW-TASK-0010。それまでは `#/play` をじかに開く）
  - ランキングの 1 位を HIGH に使うこと（MGW-TASK-0017 のあと。それまでは 0）
- ポインターの操作は、Pointer Events でまとめて受けた。PC のマウスに加え、iPhone でもゲーム画面を触ると動く（操作空間とタッチの決まりの確認は MGW-TASK-0013）。
- キーで動かしたら、マウスの位置は追わない（キーを離したあと、発射台がマウスの位置へ戻らないようにするため）。
- 爆発の絵は、2 枚を光の筋と粒で作った（設計は大きさと枚数だけを決めている）。
- デバッグ表示の `steps/s` は、最初は「直近 1 秒に入った描画で進めたステップの合計」だった。WS-0002 の手動テストで iPhone が 120〜122 と出た（描画の時刻の揺れで、1 秒の窓に描画が 61 回入ると 122 になる）。「窓の最初から最後までに進めたステップ ÷ その時間」で出し、小数 1 桁まで表示するように直した（`src/app/step-stats.ts`、`tests/unit/step-stats.test.ts`。fix/TASK-0008-debug-steps-rate）。ゲームの動きは変えていない。

## 4. 確認できなかったこと

- 描いた絵そのもの（ドット絵の見た目・光線の揺れ・炎の点滅）は Canvas なので E2E では読めない（MGW-TD-0003 §6）。§2 の手動で見る。
