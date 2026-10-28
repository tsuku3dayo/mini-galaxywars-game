---
id: MGW-TD-0003
type: technical-design
title: render の設計（描く順番・ドット絵・フォント・擬似カラー）
status: stable
version: 1.0
updated: 2026-10-26
sources:
  - MGW-TD-0001（v1.0）
  - MGW-TD-0002（v1.2）
  - MGW-GUI-0001（v1.0）
  - MGW-GUI-0003（v1.0）
  - MGW-GUI-0006（v1.0）
  - MGW-US-0005（v1.0）
  - MGW-US-0007（v1.0）
  - MGW-US-0009（v1.0）
  - MGW-US-0015（v1.0）
  - MGW-US-0028（v1.0）
  - MGW-US-0029（v1.0）
  - MGW-ADR-0007（v1.1）
  - doc/specification.md (v1.5) §2、§19
verified: null
---

# MGW-TD-0003 render の設計

## 1. 関数

| 関数 | 中身 |
| :--- | :--- |
| `createRenderer(canvas): Renderer` | 2D コンテキストを取り、`imageSmoothingEnabled = false` にする |
| `renderer.resize(scale, dpr)` | Canvas の画素を `480 × scale × dpr` × `640 × scale × dpr` にし、`setTransform(scale × dpr, …)` で論理座標のまま描けるようにする |
| `renderer.draw(state: GameState \| null, view: { mode: 'cellophane' \| 'pixel'; showHud: boolean; tick: number })` | 1 回の描画。`state` が null（タイトル・ランキング）のときは背景と飾りだけ |

render は `GameState` を読むだけで、書き換えない（MGW-ADR-0001）。

## 2. 描く順番

1. 黒で全体を塗る。
2. 隕石 → 光線 → UFO → 発射台 → ミサイル → バックファイア → 爆発。
3. HUD（`SCORE`・5 桁、`HIGH`・5 桁、残機のアイコン）。
4. 擬似カラー（`mode === 'cellophane'` のとき。§5）。
5. 被弾フラッシュ（`flashSteps > 0` のとき。どちらの方式でも）：全体を `#FF0000` で塗る。

## 3. ドット絵（`sprites.ts`）

文字列の配列で 1 ビットの絵を持ち、`fillRect` で 1 ドットずつ描く（起動のときに `OffscreenCanvas` か `canvas` に一度描いておき、`drawImage` で写す）。

| 絵 | 大きさ（論理 px） | 形 |
| :--- | :--- | :--- |
| UFO | 32 × 24 | 上がドーム、真ん中が円盤、下に中央のふくらみ（12 × 8）と 2 本の突起（6 × 8）。部位の四角（MGW-TD-0002 §7.1）と形をそろえる |
| ミサイル | 12 × 24 | 先のとがった形 |
| 発射台 | 48 × 16 | 台形。中央にミサイルの差し込み口 |
| 隕石 | 24 × 24 | でこぼこの丸。当たりは 20 × 20 |
| 光線 | 4 × 16 | 波の形（ニョロニョロ線）。`tick` で 2 枚を切り替えて揺らす |
| バックファイア | 8 × 12 | 噴射中だけ、ミサイルの下に。`tick` で点滅 |
| 爆発 | 32 × 32 | 2 枚を `explosion.steps` で切り替え |
| 残機のアイコン | 16 × 6 | 発射台の縮小 |

- UFO が画面の端をまたぐときは、反対の端にも描く。

## 4. フォント

- 5 × 7 のドット文字を 8 × 8 の枠に入れた自前のフォント。`0-9`・`A-Z`・空白と `! ? : . - / ( )` を持つ。
- HUD は 2 倍（1 文字 16 × 16 論理 px）。`SCORE 00150` を左上（x 12, y 8）、`HIGH 03000` を右上（右端 x 468, y 8）、残機を右の 2 行目（y 32）に右から並べる。
- `READY`・`PAUSE`・`GOOD!!` などの大きい文字は DOM（MGW-TD-0004）で出す。Canvas に描くのは HUD だけ。

## 5. 擬似カラー（`color-palette.ts`）

`globalCompositeOperation = 'multiply'` で色の帯を重ね、白い絵だけに色を乗せる（黒はそのまま黒）。

| 帯（論理 y） | 色 |
| :--- | :--- |
| 0–120 | `#FF50D0`（紫・赤系） |
| 120–580 | 重ねない（白） |
| 580–640 | `#50FF70`（緑系） |

- ピクセルパーフェクトでは重ねない。Canvas の CSS に `image-rendering: pixelated` を付け、拡大でぼやけないようにする（MGW-US-0029）。
- 被弾フラッシュは帯のあとに `source-over` で全体を `#FF0000`。

## 6. 確かめ方

- 描く中身は Canvas なので E2E から読めない。描く元の値（状態・表示方式・フラッシュ）を body の data 属性で確かめ（MGW-TD-0004 §6）、見た目は手動で確かめる。
- `color-palette.ts` の帯の範囲と色、`sprites.ts` のフォントの文字の数・ドット絵の大きさは単体テストで確かめる。
