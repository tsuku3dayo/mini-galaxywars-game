---
id: MGW-TD-0004
type: technical-design
title: app の設計（ルーティング・画面・入力・ループ・テスト用の入口）
status: stable
version: 1.5
updated: 2026-10-29
sources:
  - MGW-TD-0001（v1.1）
  - MGW-TD-0002（v1.7）
  - MGW-ADR-0002（v1.1）
  - MGW-GUI-0001（v1.5）
  - MGW-GUI-0002（v1.3）
  - MGW-GUI-0003（v1.4）
  - MGW-GUI-0004（v1.2）
  - MGW-GUI-0005（v1.2）
  - MGW-GUI-0006（v1.0）
  - MGW-US-0006（v1.1）
  - MGW-US-0007（v1.1）
  - MGW-US-0014（v1.3）
  - MGW-US-0016（v1.3）
  - MGW-US-0017（v1.1）
  - MGW-US-0018（v1.1）
  - MGW-US-0021（v1.1）
  - MGW-US-0022（v1.0）
  - MGW-US-0024（v1.0）
  - MGW-US-0025（v1.2）
  - MGW-US-0030（v1.1）
  - MGW-US-0031（v1.0）
  - MGW-US-0032（v1.0）
  - MGW-US-0033（v1.1）
  - MGW-US-0034（v1.0）
  - MGW-GUI-0008（v1.1）
  - doc/specification.md (v1.10) §4、§7、§18、§20
verified: null
---

# MGW-TD-0004 app の設計

## 1. ルーティング（`router.ts`）

| ハッシュ | 画面 | 入るとき |
| :--- | :--- | :--- |
| `#/title`（空・ほかの値も） | タイトル | ループを止め、`state = null` |
| `#/play` | プレイ | `newGame(ランキング 1 位, 種)` で始め、ループを動かす |
| `#/ranking` | ランキング | ループを止める |
| `#/credits` | クレジット（MGW-GUI-0008） | ループを止める |

- 設定（`settings`）・名前の入力（`entry`）・ランキング消去の確認（`clear`）は、ハッシュを変えずに DOM を重ねて出す（MGW-GUI-0001 §7）。
- `#/play` をじかに開いたときも、新しいゲームから始める。
- **種**（仕様書 v1.7）：ゲームを始めるたびに `crypto.getRandomValues(new Uint32Array(1))[0]` で決める（使えなければ `Date.now() >>> 0`）。`?debug=1&seed=<整数>` のときは、その値を使う（E2E で並びをそろえるため）。今のゲームの種は `data-seed` と `__mgw.getState()` で読める。
- **名前の入力欄**：幅は全角の文字が 8 文字見える幅（`8em` と余白。文字の大きさ 22 px。仕様書 v1.10）。
- **登録するもの**：スコアは合計（`state.score`）、クリアのときはタイム（`clearTimeMs(playSteps)`）も渡す（仕様書 v1.9）。
- **登録のあと**：`#/ranking` に移るとき、今登録した記録の順位を渡し（`ranking.highlight(rank)`）、その行を目立たせる。ほかから `#/ranking` を開いたときは目立たせない。

## 2. 画面の骨組み（`index.html`）

```html
<div id="app">                       <!-- 安全領域の余白を持つ（MGW-GUI-0001 §4） -->
  <div id="stage">                   <!-- 480 × 640 × 倍率。細い枠 -->
    <canvas id="game"></canvas>
    <section id="screen-title">…</section>
    <section id="screen-ranking">…</section>   <!-- 紺の画面。中でスクロール -->
    <section id="screen-credits">…</section>   <!-- 紺の画面 -->
    <section id="overlay-message">…</section>  <!-- READY・PAUSE・GOOD!!・GAME OVER -->
    <p id="standby-hint">…</p>                 <!-- 出撃待ちの「タップで出撃」 -->
    <section id="overlay-entry">…</section>
    <section id="overlay-settings">…</section>
    <section id="overlay-clear">…</section>    <!-- ランキング消去の確認 -->
    <div id="update-banner">…</div>
  </div>
  <div id="control-area">…</div>     <!-- タッチ端末だけ。角の丸い枠と案内 -->
  <div id="play-buttons">            <!-- プレイ画面だけ -->
    <button id="pause-button">‖ 一時停止</button>
    <button class="sound-toggle">🔊 効果音：オン</button>
  </div>
</div>
```

- 文言は gui-design のとおり（START・RANKING・SETTINGS・CREDITS・ランキング消去・効果音：オン／オフ・一時停止・RESUME・TITLE・GOOD!!・STAGE CLEAR・GAME OVER・NEW RECORD!・登録・スキップ・記録を書き出す・記録を読み込む・BACK・閉じる・更新 など）。
- 上のバー（`#topbar`）はなくす（仕様書 v1.7）。
- 印（← ‖ スピーカー ⤓ ⤒ ✓ ✕）はインラインの SVG で描く（MGW-GUI-0001 §5.1）。
- **効果音のボタン**（`.sound-toggle`）はタイトル画面とボタンの段の 2 か所に置き、`settings.sound` が変わったら両方の文言（と `aria-pressed`）を直す。押したらフォーカスを外し、`pointerdown` を止めてゲームの入力にしない。

### 2.1 タイトル画面（仕様書 v1.8）

- 上から：HIGH（左上）、アプリ名、点数の説明（MGW-TD-0003 §7 の Canvas と「4 機目の突起は 600」）、START・RANKING・SETTINGS・CREDITS・効果音（同じ大きさ。効果音は `.sound-toggle`）、操作の案内、ランキング消去（小さめ）。
- 中身は `#screen-title` の中のスクロールできる箱に入れる。枠に収まるときはスクロールしない。収まらないとき（iPhone SE など）は `overflow-y: auto` で枠の中だけスクロールする（ページは動かさない。MGW-GUI-0001 §4）。
- タイトル画面で `Space` を押したときは、ゲームを始め、中身をスクロールさせない（`preventDefault`）。

## 3. 大きさ（`layout.ts`）

MGW-GUI-0001 §3・§4 のとおり。

- `computeLayout({ innerWidth, innerHeight, insets, touch }) → { scale, stageW, stageH, controlH, buttonsH }` は DOM に触れない関数にし、単体テストで確かめる。上のバーの 44 をやめ、まわりの余白 8 とボタンの段（論理 64）で計算する（仕様書 v1.7）。ボタンの段が 48 px より低くなるとき（小さい画面）は段を 48 にし、残りの高さでゲーム画面と操作空間の倍率を決める（ボタン 44 が段からはみ出さないように。MGW-GUI-0001 §3）。
- `resize`・`orientationchange` で計算し直す。名前の入力欄にフォーカスがあるときは計算し直さない。
- `scroll` と `visualViewport` の `scroll`・`resize` で、スクロールが 0 でなければ 0 に戻す（入力欄にフォーカスがあるときを除く）。入力欄の `blur` のあとにも戻す。

## 4. 入力（`input.ts`）

`InputEngine` がキーとポインターの状態を持ち、ステップごとに `takeStepInput(status): StepInput` で 1 つの入力にまとめる。`launch` は 1 度だけ true を返して消す。

| 入力 | ready | playing | standby |
| :--- | :--- | :--- | :--- |
| `←` `→` `A` `D` を押している | `dir = ∓1`、`targetX = null` | 同じ | — |
| `Space` を押した瞬間 | `launch = true`（発射） | — | `launch = true`（出撃） |
| `Space` を押している | — | `boost = true` | — |
| マウスを動かす（ボタンなし） | `targetX` を更新 | 同じ | — |
| ポインターを押す（ゲーム画面・操作空間） | `targetX` を更新。押した位置を覚える | `targetX` を更新、`boost = true`（押している間） | 押した位置を覚える |
| ポインターを動かす（押している間） | `targetX` を更新。押した位置からの距離の最大を覚える | 同じ | 距離を覚える |
| ポインターを離す（距離の最大が 10 CSS px 未満＝タップ） | `launch = true`（発射） | `boost = false` | `launch = true`（出撃） |
| ポインターを離す（10 CSS px 以上動いた） | 何もしない（移動だけ） | `boost = false` | 何もしない |
| `P`・`Esc`・一時停止・RESUME | `togglePause` | 同じ | 同じ |

- ポインターの x は `(clientX − stage.left) ÷ scale` で論理座標にする。`setPointerCapture` で、指が枠の外へ出ても追う。
- タップの判定は、`isTap(down, maxDistance) = maxDistance < TAP_SLOP（10）` の DOM に触れない関数にし、単体テストで確かめる。距離は CSS px（`clientX`・`clientY`）で測る（仕様書 §20。前は離せば必ず発射していた）。
- standby のときの `launch` は、core が「出撃」として受ける（MGW-TD-0002 §6 の 5）。そのステップの `targetX` は、タップ・クリックした x（`pointerup` の位置。Space のときは最後のマウスの x）にし、発射台はそこに出る（仕様書 v1.10）。出撃したタップの `pointerup` で、そのまま発射にならないよう、`launch` は 1 度だけ true を返して消す（今までどおり）。
- 一時停止・効果音のボタンは `pointerdown` を止め、ゲームの入力にしない。
- `visibilitychange` で隠れたら、ready・playing・respawn・standby なら `togglePause`。
- タッチ端末かどうかは `matchMedia('(pointer: coarse)')`。

## 5. ループ（`loop.ts`）

```
frame(now):
  { steps, acc } = planSteps(acc, now − last)   // core/timestep.ts
  for i in 1..steps:
    input = inputEngine.takeStepInput(state.status)
    next = step(state, input)
    sounds.push(...planSounds(state, next))
    state = next
  synthesizer.play(sounds)
  renderer.draw(state, view)
  screens.update(state)        // 状態の表示（READY・PAUSE・GOOD!! など）と data 属性
  requestAnimationFrame(frame)
```

- クリアの表示（`#overlay-message`）には、`GOOD!!`・`STAGE CLEAR` の下に 4 行を出す：`UFO 01150`（`score − timeBonus`）、`TIME 95.7`（`clearTimeMs ÷ 1000` を小数第 1 位で）、`BONUS 00425`（`timeBonus`）、`TOTAL 01575`（`score`）。ゲームオーバーでは出さない（仕様書 v1.9）。
- 状態が cleared・gameOver になったら 3 秒（360 ステップ相当、時刻で数える）待ってから、ランキングに入るなら名前の入力、入らないなら「TITLE」を出す。この表示は app が受け持つ。
- `READY` の表示は、ゲームの最初の ready の 1 秒だけ（GUI-0003 §4）。
- 出撃待ち（standby）の間は `#standby-hint` を出す。文言はタッチ端末なら「タップで出撃」、PC なら「クリック/SPACEで出撃」。
- 効果音がオフのときは、`synthesizer.play(sounds)` を呼んでも鳴らさない（MGW-TD-0005）。

## 6. テスト用の入口（`debug.ts`）

### 6.1 body の data 属性（いつも付ける）

| 属性 | 値 |
| :--- | :--- |
| `data-screen` | `title`・`play`・`ranking`・`credits` |
| `data-overlay` | `none`・`pause`・`clear`・`gameover`・`entry`・`settings`・`clear-ranking` |
| `data-sound` | `on`・`off`（効果音の設定） |
| `data-seed` | 今のゲームの種（プレイ以外は空） |
| `data-status` | `GameState.status`（プレイ以外は空） |
| `data-score`・`data-high`・`data-lives` | 数 |
| `data-display-mode` | `cellophane`・`pixel` |
| `data-touch` | `true`・`false` |
| `data-update` | `waiting`（新しい版が待っている）・`none` |
| `data-audio` | `running`・`suspended`・`unavailable` |

### 6.2 `?debug=1` のとき

- `window.__mgw` を置く。

| 関数 | 中身 |
| :--- | :--- |
| `getState()` | 今の `GameState` の写し |
| `setState(patch)` | 今の状態に値を上書きする（E2E で「スコア 2,990」などを作る） |
| `freeze(on)` | ループを止める・動かす |
| `advance(steps, input?)` | ループを止めたまま、決まった入力で `steps` だけ進めて描く |
| `simulateUpdate()` | 新しい版が届いたときと同じ表示にする（「更新」を押すと `reload` の代わりに `data-update=applied`） |

- 画面の左下に、fps・直近 1 秒のステップ数・status を出す（MGW-US-0030、0031 の手動の確認に使う）。

## 7. 音を有効にする（MGW-US-0024）

「START」の `click`（と `Space`）の中で `synthesizer.unlock()`（`AudioContext.resume()`）を呼ぶ。失敗しても、ゲームは進める（`data-audio = unavailable`）。効果音がオフでも呼ぶ（オンに戻したらすぐ鳴るように。仕様書 v1.7）。効果音のボタンの `click` の中でも呼ぶ。

## 8. 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-29 | 仕様書 v1.7：§1 の `#/credits`・種・登録のあとの目立たせ方、§2 の骨組み（上のバーをなくし、ボタンの段・出撃待ちの案内・クレジット・消去の確認・効果音のボタン）、§3 のボタンの段、§4 のタップの判定と standby、§5 の出撃待ちの案内と効果音、§6 の `data-sound`・`data-seed`、§7 |
| 1.2 | 2026-10-29 | §3：ボタンの段の高さは 48 px より低くしない（MGW-TASK-0028 の実装で、iPhone SE（320 × 568）でボタンが段からはみ出したため） |
| 1.3 | 2026-10-29 | §2.1：タイトル画面の並び（点数の説明・同じ大きさの 5 つのボタン・操作の案内の下のランキング消去）と、収まらないときの枠の中のスクロール（仕様書 v1.8） |
| 1.4 | 2026-10-29 | 仕様書 v1.9：§1 の登録するもの（合計とタイム）、§5 のクリアの表示の 4 行 |
| 1.5 | 2026-10-29 | 仕様書 v1.10：§4 の出撃の位置（`targetX`）、§1 の名前の入力欄の幅 |
