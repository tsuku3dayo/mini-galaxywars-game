---
id: MGW-AC-0022
type: attested-computation
title: 増機の点数を 1,000 点にしたことの確認
status: review
version: 1.0
updated: 2026-10-28
sources:
  - MGW-TASK-0022（v1.0）
  - MGW-TC-0019（v1.1）
  - MGW-TC-0023（v1.1）
verified: null
---

# MGW-AC-0022 増機の点数を 1,000 点にしたことの確認

* **TASK**：MGW-TASK-0022（ブランチ `feat/TASK-0022-extend-score`）
* **確かめた環境**：Windows 11、Node.js v24.0.0、Vitest 5.0.5、Playwright 1.64.1

## 1. 自動テストの結果

| 確認 ID | 確かめること | 結果 | 根拠 |
| :--- | :--- | :--- | :--- |
| MGW-TC-0019-01 | スコアが 1,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | OK（core の範囲） | `✓ tests/unit/extend.test.ts > 増機 > MGW-TC-0019-01 …`。950 点から 100 点で 1,050 点・残機 4。ちょうど 1,000 でも増え、950 点では増えない |
| MGW-TC-0019-02 | スコアが 1,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える | OK（3 つの project） | `✓` › e2e\hud.spec.ts › MGW-TC-0019-02。950 点から UFO を倒して 1,050 点になると、`data-lives` が 4 になり、Canvas のアイコンの塊が 3 から 4 に増える |
| MGW-TC-0019-03 | 増機は 1 回だけ | OK | `✓ tests/unit/extend.test.ts > 増機 > MGW-TC-0019-03 …`。950 点から増機したあと、さらに点を取っても増えない。スコアは 99,999 で止まる |
| MGW-TC-0019-04 | 増えたときに増機音が鳴る | OK | `✓ tests/unit/extend.test.ts > 増機 > MGW-TC-0019-04 …`。950 点から増機したステップの音の計画に `extend` が入り、増えないときは入らない |
| MGW-TC-0023-05 | 増機すると増機音（三角波 523 → 659 → 784 Hz のアルペジオ）が鳴る | OK | `✓ tests/unit/sound-plan.test.ts > 音の計画 > MGW-TC-0023-05 …`。950 点から UFO を倒すと、`ufoDestroyed` と `extend` |

単体テストの合計：`Tests 70 passed (70)`。E2E の合計：`79 passed`、`17 skipped`。`npm run verify` も通った。

画面：この TASK は画面を変えていない（増機の点数の値だけ）。

## 2. 手動の確認（WS-0008 の終わり、2026-10-28、オーナー、iPhone 11・PC）

| 確認 ID | 確かめること | 結果 |
| :--- | :--- | :--- |
| MGW-TC-0023-06 | 1,000 点に届くと、3 つの音が上がっていく増機音が鳴る | OK（iPhone のホーム画面の本物の「GWミニ」・PC。開発者ツールを使わず、ふつうに遊んで 1,000 点に届かせた） |

MGW-AC-0015 §4 で iPhone では確かめられなかった増機音を、ここで iPhone でも確かめた。

## 3. 設計と違う作りにしたこと

なし（MGW-TD-0002 v1.3 のとおり、`EXTEND_SCORE` を 1000 にした）。

## 4. 確認できなかったこと

- Android の端末では確かめていない（実機がない。MGW-TST-0001 §6.1）。
