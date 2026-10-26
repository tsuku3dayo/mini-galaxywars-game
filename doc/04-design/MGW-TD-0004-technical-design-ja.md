---
id: MGW-TD-0004
type: technical-design
title: app の設計（ルーティング・画面・入力・ループ・テスト用の入口）
status: draft
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TD-0001（v1.0）
  - MGW-TD-0002（v1.0）
  - MGW-ADR-0002（v1.0）
  - MGW-GUI-0001（v1.0）
  - MGW-GUI-0002（v1.0）
  - MGW-GUI-0003（v1.0）
  - MGW-GUI-0004（v1.0）
  - MGW-GUI-0005（v1.0）
  - MGW-GUI-0006（v1.0）
  - MGW-US-0006（v1.0）
  - MGW-US-0007（v1.0）
  - MGW-US-0014（v1.0）
  - MGW-US-0016（v1.0）
  - MGW-US-0017（v1.0）
  - MGW-US-0018（v1.0）
  - MGW-US-0021（v1.0）
  - MGW-US-0022（v1.0）
  - MGW-US-0024（v1.0）
  - MGW-US-0025（v1.0）
  - MGW-US-0030（v1.0）
  - MGW-US-0031（v1.0）
  - doc/specification.md (v1.3) §4、§7、§18、§20
verified: null
---

# MGW-TD-0004 app の設計

## 1. ルーティング（`router.ts`）

| ハッシュ | 画面 | 入るとき |
| :--- | :--- | :--- |
| `#/title`（空・ほかの値も） | タイトル | ループを止め、`state = null` |
| `#/play` | プレイ | `newGame(ランキング 1 位)` で始め、ループを動かす |
| `#/ranking` | ランキング | ループを止める |

- 設定（`settings`）と名前の入力（`entry`）は、ハッシュを変えずに DOM を重ねて出す（MGW-GUI-0001 §7）。
- `#/play` をじかに開いたときも、新しいゲームから始める。

## 2. 画面の骨組み（`index.html`）

```html
<div id="app">                       <!-- 安全領域の余白を持つ（MGW-GUI-0001 §4） -->
  <header id="topbar"><button id="pause-button">Pause</button></header>
  <div id="stage">                   <!-- 480 × 640 × 倍率 -->
    <canvas id="game"></canvas>
    <section id="screen-title">…</section>
    <section id="screen-ranking">…</section>
    <section id="overlay-message">…</section>  <!-- READY・PAUSE・GOOD!!・GAME OVER -->
    <section id="overlay-entry">…</section>
    <section id="overlay-settings">…</section>
    <div id="update-banner">…</div>
  </div>
  <div id="control-area">…</div>     <!-- タッチ端末だけ -->
</div>
```

- 文言は gui-design のとおり（START・RANKING・SETTINGS・Pause・RESUME・TITLE・GOOD!!・STAGE CLEAR・GAME OVER・NEW RECORD!・登録・スキップ・書き出し・読み込み・閉じる・更新 など）。

## 3. 大きさ（`layout.ts`）

MGW-GUI-0001 §3・§4 のとおり。

- `computeLayout({ innerWidth, innerHeight, insets, touch }) → { scale, stageW, stageH, controlH }` は DOM に触れない関数にし、単体テストで確かめる。
- `resize`・`orientationchange` で計算し直す。名前の入力欄にフォーカスがあるときは計算し直さない。
- `scroll` と `visualViewport` の `scroll`・`resize` で、スクロールが 0 でなければ 0 に戻す（入力欄にフォーカスがあるときを除く）。入力欄の `blur` のあとにも戻す。

## 4. 入力（`input.ts`）

`InputEngine` がキーとポインターの状態を持ち、ステップごとに `takeStepInput(status): StepInput` で 1 つの入力にまとめる。`launch` は 1 度だけ true を返して消す。

| 入力 | ready | playing |
| :--- | :--- | :--- |
| `←` `→` `A` `D` を押している | `dir = ∓1`、`targetX = null` | 同じ |
| `Space` を押した瞬間 | `launch = true` | — |
| `Space` を押している | — | `boost = true` |
| マウスを動かす（ボタンなし） | `targetX` を更新 | 同じ |
| ポインターを押す（ゲーム画面・操作空間） | `targetX` を更新 | `targetX` を更新、`boost = true`（押している間） |
| ポインターを動かす（押している間） | `targetX` を更新 | 同じ |
| ポインターを離す | `launch = true` | `boost = false` |
| `P`・`Esc`・Pause・RESUME | `togglePause` | 同じ |

- ポインターの x は `(clientX − stage.left) ÷ scale` で論理座標にする。`setPointerCapture` で、指が枠の外へ出ても追う。
- Pause ボタンは `pointerdown` を止め、ゲームの入力にしない。
- `visibilitychange` で隠れたら、ready・playing・respawn なら `togglePause`。
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

- 状態が cleared・gameOver になったら 3 秒（360 ステップ相当、時刻で数える）待ってから、ランキングに入るなら名前の入力、入らないなら「TITLE」を出す。この表示は app が受け持つ。
- `READY` の表示は、ゲームの最初の ready の 1 秒だけ（GUI-0003 §4）。

## 6. テスト用の入口（`debug.ts`）

### 6.1 body の data 属性（いつも付ける）

| 属性 | 値 |
| :--- | :--- |
| `data-screen` | `title`・`play`・`ranking` |
| `data-overlay` | `none`・`pause`・`clear`・`gameover`・`entry`・`settings` |
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

「START」の `click`（と `Space`）の中で `synthesizer.unlock()`（`AudioContext.resume()`）を呼ぶ。失敗しても、ゲームは進める（`data-audio = unavailable`）。
