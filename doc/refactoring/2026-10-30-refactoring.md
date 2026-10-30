# ソースコードの確認とリファクタリング（2026-10-30）

* **対象**：main（9276085、アプリ 1.0.0）の `src/`（TypeScript 約 3,000 行、CSS 約 700 行）
* **ブランチ**：`refactor/small-cleanups`
* **決まり**：見た目・動き・保存の形は変えない。仕様書・承認済みの成果物は変えない（変更の依頼は要らない）。設計（TD）と違う所だけ TD を直す。

---

## 1. チェックの結果

### 1.1 全体の見立て

**大きなリファクタリングは要らない。**

- 層の分け方（core・render・audio・storage・app）が守られている。ESLint の層の決まり（MGW-ADR-0001）と、層の決まりの単体テストで裏づけられている。
- ロジック（ルール・物理・得点・音の計画・描く物の決め方）は、DOM・時刻に触れない関数に分かれていて、単体テスト 102 件で確かめている。
- 見つかったのは、小さな重複・古いコメント・使われていないもの・保存の失敗の扱いのばらつきだけだった。

### 1.2 見つかったこと

| No | 種類 | 場所 | 内容 | 判断 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 古いコメント | `src/core/physics.ts:75` | 「噴射中は上昇 280・横 240、そうでなければ上昇 180・横 120」。速さを 1/4 にする前（仕様書 v1.6 より前）の値で、今は 70・60 と 45・30 | 直す |
| 2 | 重複 | `src/app/screens/play.ts:16`・`ranking.ts:41`・`clear-ranking.ts:10` | 押したらフォーカスを外す `button()` が 3 か所に同じ形である | 直す |
| 3 | 重複 | `src/render/hud.ts:22`・`src/app/screens/play.ts:35`・`title.ts:11`・`entry.ts:11` | 5 桁のゼロ詰め `pad5` が 4 か所にある（上限で止めるもの・止めないものが混ざる） | 直す |
| 4 | 重複 | `src/main.ts:81`・`:100`・`:147`・`:165` | 「保存できなくても続ける」try/catch が 4 か所 | 直す |
| 5 | 重複 | `src/main.ts:199`・`:282` | 「新しい版が待っている」ときの処理が、本物の更新とテスト用の `simulateUpdate` で同じ | 直す |
| 6 | 失敗の扱いのばらつき | `src/app/screens/ranking.ts:150` | 記録の読み込みの「置き換える」だけ、保存を try/catch で囲んでいない。保存できない（容量など）と例外になり、確認の枠が閉じない | 直す |
| 7 | 重複 | `src/render/canvas.ts:134`・`:139` | 爆発の 2 枚のどちらを出すかを、ミスと UFO を倒したときで別々の書き方で決めている | 直す |
| 8 | 使われていない | `src/app/sound-toggle.ts:7` | `SoundToggle.isOn()` をどこからも呼んでいない | 消す |
| 9 | 使われていない | `src/render/canvas.ts:45` | `View.showHud` はいつも `true` で渡している | 消す（TD-0003 も直す） |
| 10 | 使われていない | `src/core/types.ts`（`GameState.lastKill`） | core で書くだけで、読むのはテストだけ | **残す**。消すと仕様書 §17・再現開発仕様書の型が変わり、変更の依頼が要る |
| 11 | 使われていない | `src/core/config.ts:10`（`REGIONS`） | テストだけが使う | **残す**。仕様書 §2.1 の領域の値をテストで確かめるのに使っている |
| 12 | 大きさ | `src/main.ts`（約 300 行） | 画面とゲームの組み立て | **直さない**。上から順に読め、分けても読みやすさは変わらない |
| 13 | 大きさ | `src/render/sprites.ts`（約 250 行） | ほとんどがドット絵とフォントのデータ | **直さない** |

---

## 2. リファクタリングの結果

### 2.1 直したこと

| No | 直したこと | ファイル |
| :--- | :--- | :--- |
| 1 | コメントを、値ではなく定数の名前（`MISSILE_SPEED_BOOST` など）で書いた（値を変えてもずれない） | `src/core/physics.ts` |
| 2 | `button(label, onClick, iconName?)` を 1 つにまとめ、3 か所から使う。一時停止のボタンも印をこの引数で付ける | `src/app/button.ts`（新しく作った）、`play.ts`・`ranking.ts`・`clear-ranking.ts` |
| 3 | `pad5` を `src/render/hud.ts` のもの（0〜99,999 で止める）にそろえた。app から render を読むのは層の決まりどおり | `play.ts`・`title.ts`・`entry.ts` |
| 4 | `trySave(save)` を作り、4 か所の try/catch を置き換えた | `src/main.ts` |
| 5 | `markUpdateWaiting()` を作り、本物の更新と `simulateUpdate` で同じものを使う | `src/main.ts` |
| 6 | 「置き換える」の保存を try/catch で囲み、保存できなくても確認を閉じて今の記録を出し直すようにした（ほかの保存と同じ扱い） | `src/app/screens/ranking.ts` |
| 7 | `explosionFrame(elapsed)` を作り、ミスと UFO を倒したときの爆発の両方で使う（出す枚の境目は変わらない） | `src/render/kill-effect.ts`、`src/render/canvas.ts` |
| 8 | `SoundToggle` と `isOn()` を消した（`createSoundToggle` は何も返さない） | `src/app/sound-toggle.ts` |
| 9 | `View.showHud` を消し、HUD はいつも描く（今までと同じ） | `src/render/canvas.ts`、`src/main.ts` |

変更の量：`src/` の 11 ファイル（新しく作った 1 つを含む）、増えた行 71・減った行 101。

### 2.2 文書

| 文書 | 直したこと |
| :--- | :--- |
| MGW-TD-0003 v1.7 → v1.8 | §1 の `renderer.draw` の `view` から `showHud` を消した（承認のない成果物） |
| TD-0003 を sources に持つ TC・TASK（14 件） | sources の版の表記だけ直した |
| 仕様書・再現開発仕様書・承認済みの成果物 | 変えていない（型・値・動きは同じ） |

### 2.3 確かめたこと

| 確かめ方 | 結果 |
| :--- | :--- |
| `npm run verify`（lint・単体テスト・build・dist の検査・check:docs） | 通った。単体テスト 102 件、check:dist エラー 0、check:docs エラー 0 |
| E2E（`pc-chromium`・`iphone11-webkit`・`iphonese-webkit`） | 通った。190 passed（合う project だけで動かすものの残り 20 件は skipped。1.0.0 のときと同じ数） |

見た目と動きは変えていないので、実機の手動テストはしない。今までの自動テスト（単体・E2E）を、テストを変えずにすべて通すことで確かめた。

### 2.4 公開

この PR は、マージすると公開される。見た目・動き・保存の形は 1.0.0 と同じなので、`package.json` の版は 1.0.0 のままにする。
