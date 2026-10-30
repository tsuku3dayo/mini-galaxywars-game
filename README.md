# 銀河戦争ミニ

1979 年のアーケードゲーム『ギャラクシーウォーズ』を、iPhone の縦画面と PC のブラウザで遊べるように作り直した Web アプリ（PWA）です。

**遊ぶ**：https://tsuku3dayo.github.io/mini-galaxywars-game/

- iPhone では、Safari の共有 →「ホーム画面に追加」で、アプリのように使えます。一度開けば、通信のないところでも遊べます。
- 新しい版を公開すると、タイトル画面に「新しい版があります」と出ます。「更新」を押すと切り替わります。今の版は、タイトル画面の右上に出ています。

## 原作について

- このアプリは、1979 年の『ギャラクシーウォーズ』（ユニバーサル。タイトーからもライセンス販売）を再現することを目的とした、**非公式の作品**です。原作の権利者とは関係がなく、許諾を受けたものではありません。
- 『ギャラクシーウォーズ』の作品名と原作の権利は、それぞれの権利者に帰属します。
- 絵（UFO・ミサイル・隕石・文字）は自作し、音は Web Audio で合成しています。原作の画面の画像・ROM のデータ・音の録音は使っていません。

## 遊び方

発射台からミサイルを撃ち出し、ミサイルそのものを操って UFO に体当たりします。UFO 8 機をすべて倒すとクリアです（1 面のみ）。

| 操作 | iPhone（タッチ） | PC |
| :--- | :--- | :--- |
| 発射台・ミサイルを左右に動かす | 下の操作空間（またはゲーム画面）をなぞる | マウス / `←` `→` / `A` `D` |
| 発射・出撃 | タップ | クリック / `Space` |
| 加速噴射 | 押し続ける | マウスボタン / `Space` を押し続ける |
| 一時停止 | 「一時停止」ボタン | 「一時停止」ボタン / `P` / `Esc` |

- 隕石や UFO の光線に当たるとミスです（発射前の発射台に光線が当たってもミス）。ミサイルの先端で光線を受けると弾き返せます。
- 点数：UFO の側面・上部 50、下部中央 100、下部の突起 150。4 機目を突起で倒すと 600。1,000 点で発射台が 1 つ増えます。
- クリアすると、早いほど大きい時間ボーナスが足されます。
- ランキング（上位 10 件）は端末の中だけに保存します。JSON で書き出し・読み込みができます。
- SETTINGS で表示方式（擬似カラーセロハン / ピクセルパーフェクト）を選べます。効果音はオン・オフできます。

## クレジット

| 役割 | 名前 |
| :--- | :--- |
| PRODUCER・DIRECTOR・GAME DESIGNER | つくだ よしはる |
| GRAPHIC DESIGNER・SOUND CREATOR・PROGRAMMER | CLAUDE CODE |

## 開発

Node.js 24 と npm を使います。

```sh
npm install
npm run dev          # 開発用のサーバー
npm run verify       # Lint・単体テスト・ビルド・dist の検査・文書の検査
npm run test:e2e     # E2E（Playwright。先に npm run build）
```

| コマンド | 内容 |
| :--- | :--- |
| `npm run build` | 型の検査とビルド（`dist/`） |
| `npm run preview` | ビルドしたものを手元で開く |
| `npm run lint` | ESLint（層の決まりも確かめる） |
| `npm test` | 単体テスト（Vitest） |
| `npm run check:dist` | `dist/` に外部の URL がないこと、マニフェスト・Service Worker |
| `npm run check:docs` | `doc/` の成果物の整合性（リリースでは `node scripts/check-docs.mjs --strict`） |

- main へのマージで、GitHub Actions が GitHub Pages に公開します。
- 版は `package.json` の `version` で、ビルドのときにタイトル画面へ埋め込みます。

### ファイル構成

```
src/
├── core/      # ロジック（ルール・物理・得点。DOM・時刻・乱数に触れない）
├── render/    # Canvas の描画・ドット絵・擬似カラー
├── audio/     # Web Audio の効果音
├── storage/   # ランキング・設定（localStorage）
├── app/       # 画面・入力・ループ・PWA・デバッグ
└── main.ts
public/        # boot.js（起動の復旧）・アイコン
tests/unit/    # Vitest
e2e/           # Playwright
scripts/       # check-dist.mjs・check-docs.mjs
doc/           # 仕様書・設計・テスト・作業の記録
```

### 文書

- `doc/specification.md`：仕様書
- `doc/workflow.txt`：開発の進め方
- `doc/00-project-brief` 〜 `doc/07-attested`：概要・構成・要件・画面設計・詳細設計・テスト・作業計画・実施記録
- `doc/requests`：仕様の変更の依頼
- `doc/retrospectives`：ふりかえり
