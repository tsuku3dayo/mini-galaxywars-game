---
id: MGW-TD-0002
type: technical-design
title: core の設計（定数・状態・ステップ・当たり判定・得点・音の計画）
status: stable
version: 1.6
updated: 2026-10-29
sources:
  - MGW-TD-0001（v1.1）
  - MGW-ADR-0001（v1.0）
  - MGW-ADR-0002（v1.1）
  - MGW-US-0006（v1.1）
  - MGW-US-0007（v1.1）
  - MGW-US-0008（v1.1）
  - MGW-US-0009（v1.2）
  - MGW-US-0010（v1.2）
  - MGW-US-0011（v1.1）
  - MGW-US-0012（v1.0）
  - MGW-US-0013（v1.2）
  - MGW-US-0016（v1.2）
  - MGW-US-0017（v1.1）
  - MGW-US-0018（v1.1）
  - MGW-US-0019（v1.2）
  - MGW-US-0020（v1.0）
  - MGW-US-0023（v1.3）
  - MGW-US-0030（v1.1）
  - MGW-GUI-0003（v1.3）
  - doc/specification.md (v1.9) §2、§3、§5、§6、§7、§11、§17、§22
  - doc/requests/2026-10-26-spec-1.4-design-values.md
verified: null
---

# MGW-TD-0002 core の設計

`src/core/` は、状態と入力を受け取って次の状態を返す関数だけを持つ。DOM・時刻・`Math.random` には触れない（MGW-ADR-0001）。乱数は、app が渡す種から決まった式で作る（§10、MGW-ADR-0002）。
速さは仕様書 v1.6 で原作の 1/4（光線は 1/2）にした値。★ の付いた値は仕様書 v1.3 になく、ここで決めて仕様書 v1.4 に足したもの（doc/requests/2026-10-26-spec-1.4-design-values.md）。

## 1. 座標と単位

- 座標は論理座標（左上が 0,0。x は右、y は下が正）。物の位置は **中心** の座標で持つ。
- 当たり判定は、軸にそろった四角（AABB）の重なりで調べる。辺が接しただけ（重なりの幅 0）は当たりにしない。
- 時間はステップ（1/120 秒）の数で持つ。速さ v px/秒 は 1 ステップに v / 120 px 動く。
- 小数は IEEE 754 の倍精度をそのまま使う。計算の順番を固定するので、同じ入力なら同じ結果になる（MGW-US-0030）。

## 2. 定数（`config.ts`）

| 定数 | 値 | 仕様書 | 説明 |
| :--- | :--- | :--- | :--- |
| `FIELD_WIDTH`・`FIELD_HEIGHT` | 480・640 | §11 | |
| `CEILING_Y` | 48 | §2.1 | HUD 帯の下端 |
| `REGIONS` | HUD 帯 0–48・UFO 通過領域 48–120・隕石往復領域 120–580・発射台待機領域 580–616・地面 616–618・残機表示 620–636 | §2.1 | 縦の領域（上端・下端） |
| `STEPS_PER_SECOND` | 120 | §5.1 | |
| `MAX_STEPS_PER_FRAME` | 12 | §5.1 | |
| `LAUNCHER_W`・`LAUNCHER_H` | 48・16 | §3.1 | |
| `LAUNCHER_Y` | 608 ★ | | 発射台の中心（上端 600・下端 616。ミサイルの下の部分が発射台に差し込まれた形） |
| `LAUNCHER_X_MIN`・`LAUNCHER_X_MAX` | 24・456 ★ | | 画面の端で止まる |
| `LAUNCHER_START_X` | 240 | | 初めと出直しのときの発射台の x（§5、§6 の 9） |
| `LAUNCHER_KEY_SPEED` | 60 px/秒 ★ | | キーでの発射台の横の速さ |
| `LAUNCHER_POINTER_SPEED` | 120 px/秒 ★ | | 指・マウスの x へ近づく速さの上限 |
| `MISSILE_W`・`MISSILE_H` | 12・24 | §3.1 | |
| `MISSILE_READY_Y` | 596 | §3.1 | 先端 584 |
| `MISSILE_SPEED_NORMAL`・`_BOOST` | 45・70 px/秒 | §11 | 上昇 |
| `MISSILE_LATERAL_LOW`・`_HIGH` | 30・60 px/秒 | §11 | 横 |
| `MISSILE_X_MIN`・`MISSILE_X_MAX` | 6・474 ★ | | |
| `UFO_W`・`UFO_H` | 32・24 ★ | | |
| `UFO_ROW_Y` | 76・108 | §2 | 上段（右へ）・下段（左へ）の中心 |
| `UFO_START_X` | 60・180・300・420 ★ | | 両段とも同じ列から始める |
| `UFO_SPEEDS` | 8 機 20・25・30・35・40・45・60・1 機 80 | §3.2 | 残り機数で引く |
| `BEAM_W`・`BEAM_H` | 4・16 ★ | | |
| `BEAM_SPEED` | 90 px/秒 | §3.2 | |
| `BEAM_INTERVAL` | 90 ステップ（0.75 秒） | §3.2 | |
| `BEAM_MAX` | 5 機以上 3・4 機以下 4 | §3.2 | |
| `REFLECT_HALF_W` | 2 ★ | §3.4 | 先端の中央 ±2 px（横幅 4 px） |
| `METEOR_SIZE` | 24 ★ | | 描く大きさ |
| `METEOR_HIT` | 20 ★ | | 当たりの四角の 1 辺（見た目より少し小さい） |
| `METEOR_LANES` | 11 段、y = 136 + 40 × 段 ★ | §3.3 | 最下段 y = 536（当たりの下端 546 は、発射前のミサイルの先端 584 より上） |
| `METEOR_X_MIN`・`METEOR_X_MAX` | 12・468 ★ | §3.3 | ここで向きを変えて 1 段下がる |
| `METEOR_SPEED_RIGHT`・`_LEFT` | 45・30 px/秒 | §3.3 | |
| `METEOR_COUNT` | 5 | §3.3 | |
| `METEOR_PATH_LENGTH` | 5,016 | §3.3 | 1 周の道のり（456 px × 11 段） |
| `METEOR_MIN_GAP` | 501.6（道のりの 1/10） | §3.3、§11 | 初めの並びで、となりどうしの間の最小 |
| `INITIAL_LIVES` | 3 | §6.3 | |
| `EXTEND_SCORE` | 1000 | §6.3 | |
| `MISS_RESPAWN` | 240 ステップ（2 秒） | §7 | |
| `EXIT_RESPAWN` | 120 ステップ（1 秒） | §3.1 | 最上部を抜けたとき・UFO を倒したとき |
| `IDLE_LIMIT_1`・`_2` | 10,800・18,000 ステップ（90・150 秒） | §3.5 | |
| `FLASH_STEPS` | 12（100 ms） | §19 | |
| `EXPLOSION_STEPS` | 48（0.4 秒）★ | | 爆発の絵を出す長さ（ミス・UFO を倒したとき） |
| `KILL_EFFECT_STEPS` | 120（1 秒） | §6.1 | UFO を倒してから、爆発と得点を出す長さ（`EXIT_RESPAWN` と同じ） |
| `UFO_FRAME_STEPS` | 30（0.25 秒） | §3.2 | UFO・光線の 2 コマを切り替える間隔 |
| `SCORE_MAX` | 99,999 ★ | | 5 桁で止める |
| `TIME_BONUS_BASE` | 180 秒 | §6.4、§11 | 時間ボーナスの基準（仕様書 v1.9） |
| `TIME_BONUS_PER_SEC` | 5 点 | §6.4、§11 | 1 秒早いごとに増える点 |

## 3. 型（`types.ts`）

仕様書 §17 の型を元に、足りないものを足す。

```typescript
export type GameStatus = 'ready' | 'playing' | 'respawn' | 'standby' | 'paused' | 'cleared' | 'gameOver';
// respawn：ミスのあと・最上部を抜けたあと・UFO を倒したあとの待ち（仕様書 §7 の「2 秒」「1 秒」）
// standby：出撃待ち（respawn のあと。タップで ready へ。仕様書 v1.7）

export type UfoPart = 'body' | 'bottom' | 'prong'; // 側面・上部 / 下部中央 / 突起

export interface Missile { x: number; y: number; isLaunched: boolean; isBoosting: boolean; }
export interface UFO { id: number; x: number; y: number; row: 0 | 1; isAlive: boolean; }
export interface Meteor { pos: number; x: number; y: number; lane: number; direction: 1 | -1; }
export interface Beam { x: number; y: number; vy: number; reflected: boolean; }

export interface GameState {
  status: GameStatus;
  pausedFrom: 'ready' | 'playing' | 'respawn' | 'standby' | null;
  stepCount: number;
  score: number;
  highScore: number;             // 始めたときのランキング 1 位。表示は max(highScore, score)
  lives: number;                 // 画面に出ている発射台を含む
  extended: boolean;
  launcherX: number;
  missile: Missile;
  ufos: UFO[];
  killCount: number;
  meteors: Meteor[];
  beams: Beam[];
  beamTimer: number;             // 次の光線までのステップ
  idleSteps: number;             // 永久パターン防止のタイマー
  waitSteps: number;             // respawn の残り
  waitReason: 'miss' | 'exit' | 'kill' | null;
  flashSteps: number;
  explosion: { x: number; y: number; steps: number } | null;
  lastKill: { part: UfoPart; points: number } | null;
  killEffect: { x: number; y: number; points: number; steps: number } | null; // 倒した UFO の位置の爆発と得点（§6.4）
  playSteps: number;             // 時間ボーナスの経過時間。ステップの始まりで playing のときだけ 1 足す（仕様書 v1.9）
  timeBonus: number;             // クリアしたときの時間ボーナス（それまでは 0。§7.3）
}

export interface StepInput {
  dir: -1 | 0 | 1;               // キー（←→・A D）
  targetX: number | null;        // 指・マウスの x（なければ null）
  launch: boolean;               // このステップでタップした（ready なら発射、standby なら出撃。タップ・クリック・Space の瞬間だけ true）
  boost: boolean;                // 加速噴射を続けている
}
```

## 4. 関数（`game.ts` ほか）

| 関数 | 中身 |
| :--- | :--- |
| `newGame(highScore: number, seed: number): GameState` | 1 面の初めの状態（status は ready）。`seed` は 32 ビットの符号なし整数（app が決める。§10） |
| `step(state, input): GameState` | 1 ステップ進める。新しいオブジェクトを返し、引数は変えない |
| `togglePause(state): GameState` | ready・playing・respawn・standby → paused（`pausedFrom` に元を残す）、paused → 元に戻す。cleared・gameOver では何もしない |
| `createRandom(seed): () => number`（`random.ts`） | §10 の擬似乱数。呼ぶたびに 0 以上 1 未満の数を返す |
| `meteorStartPositions(seed): number[]`（`random.ts`） | §5 の隕石の初めの道のりの位置 5 つ |
| `displayHighScore(state): number` | `max(highScore, score)` |
| `planSteps(acc, elapsedMs): { steps, acc }`（`timestep.ts`） | 積み上げ時間に経過時間を足し、1/120 秒ごとに 1 ステップ。最大 12。超えた分は捨てる（積み上げを 0 にする）。60 Hz の足し算の誤差で 1 ステップ足りなくならないよう、比べるときに 1e-6 ms の余裕を持つ |
| `planSounds(prev, next): SoundCommand[]`（`sound-plan.ts`） | §8 |

## 5. 初めの状態

- 発射台は x = 240。ミサイルは発射台の上（240, 596）。
- UFO は id 0〜3 が上段（y 76）、4〜7 が下段（y 108）。x は 60・180・300・420。
- 隕石の道のりを 1 本の線とみなす。段 0（y 136）を左端から右端へ、段 1 を右端から左端へ…と、11 段で 1 周（1 段 456 px、1 周 5,016 px）。段の偶数は右へ、奇数は左へ進む。
- 隕石の初めの位置（仕様書 v1.7）：`meteorStartPositions(seed)` で決める。`r = createRandom(seed)` として、
  1. 始めの位置 `base = r() × 5,016`。
  2. 5 つの重み `w_k = r() + 0.001`（k = 0〜4）。間 `gap_k = 501.6 + 2,508 × w_k ÷ Σw`（2,508 は 5,016 − 5 × 501.6。間の合計がちょうど 1 周になり、どの間も 501.6 以上）。
  3. 隕石 0 は `base`、隕石 k は `(隕石 k−1 の位置 + gap_{k−1}) mod 5,016`。
  - `r()` を呼ぶ順番は上のとおりに固定する（同じ種なら同じ並び）。
- `beamTimer = 90`、ほかのタイマーは 0、`lives = 3`。

## 6. 1 ステップの手順（`step`）

paused・cleared・gameOver のときは何もしない（`stepCount` も進めない）。それ以外は次の順で行う。

1. `stepCount += 1`。`flashSteps`・`explosion.steps`・`killEffect.steps` を 1 減らす（0 で止める・消す）。
2. **UFO を動かす**：生きている機数で速さを引き、上段は右、下段は左へ。画面の端を出たら反対の端から出る（x を 480 で回す）★。
3. **隕石を動かす**：`pos` を進める（段の向きが右なら 45、左なら 30 px/秒）。段の端に着いたら次の段へ（端で向きを変えて 1 段下がる）。最下段の端の次は最上段の左端（1 周）。`x`・`y`・`lane`・`direction` は `pos` から計算する。
4. **光線を動かす**：`y += vy / 120`。下へは画面の下（y > 640）、上へ弾いたものは天井（y < 48）を出たら消す。弾いていない光線が隕石に重なったら消す（盾）。
5. **発射台・ミサイルを動かす**
   - ready：入力から発射台の x を決める（`dir` があれば 60 px/秒、`targetX` があれば 120 px/秒を上限に近づく）。ミサイルは発射台の上。`launch` なら status を playing にし、`isLaunched = true`。
   - playing：`isBoosting = input.boost`。上昇は 45／70、横は 30／60 px/秒で、`dir` か `targetX` の方へ動く。
   - respawn：発射台もミサイルも出さない。
   - standby：発射台もミサイルも出さない。`launch` なら status を ready にし、発射台を x = 240 に出してミサイルを乗せる（このステップでは発射しない。発射は次のタップ）。
6. **当たり判定**（ready・playing のとき。仕様書 §5.2 の順。ミスかクリアが決まったら、残りは調べない）
   1. ミサイル × 隕石 → ミス（ready のときも。隕石の段は発射前のミサイルに届かないので、実際に当たるのは playing のとき）。
   2. ミサイル × UFO → §7 の得点。8 機目ならクリア。そうでなければ §6.4（ミサイルを消して待つ）。当たる UFO は 1 機だけ（下段を先に調べ、最初に当たった 1 機）。
   3. ミサイル・発射台 × 光線（弾いていないもの）→ 弾く範囲なら弾く（MGW-US-0012）。そうでなければミス。発射台に当たってもミス★。
7. **最上部を抜けたか**：playing でミサイルの下端（y + 12）が 48 より上 → respawn（`waitReason = 'exit'`、`waitSteps = 120`）。光線を撃つのも止める。
8. **光線を撃つ**（ready・playing のとき）：`beamTimer -= 1`。0 になったら 90 に戻し、画面の光線（弾いたものを除く）が上限より少なければ、§6.2 の UFO が撃つ。
9. **待ち**（respawn）：`waitSteps -= 1`（このステップで待ちに入ったときは減らさず、次のステップから数える。ちょうど 240・120 ステップで戻る）。0 になったら（ミス・最上部・UFO を倒したあと、どれも同じ）、残機が 0 なら gameOver、そうでなければ standby（出撃待ち。仕様書 v1.7。前は ready にして発射台を出していた）。
10. **永久パターン防止**（ready・playing・respawn・standby のとき）：`idleSteps += 1`。10,800 に着いたら残機が 2 以上なら 1 にする。18,000 に着いたら gameOver。

### 6.1 ミスのとき

`lives -= 1`、status を respawn（`waitReason = 'miss'`、`waitSteps = 240`）。`flashSteps = 12`、ミサイルの位置に爆発。ミサイルは消す。UFO は戻さない。隕石と、出ている光線は動き続ける。最後の 1 基でのミスも 2 秒待ってから gameOver にする★。

### 6.2 光線を撃つ UFO

生きている UFO のうち、ミサイル（ready のときは発射台）の x との差 `|ufo.x − x|` がいちばん小さいもの。同じなら下段を先に、それでも同じなら id の小さい方★。光線はその UFO の真下（x = ufo.x、y = ufo.y + 12 + 8）から 90 px/秒で落ちる。

### 6.3 光線弾き（MGW-US-0012）

弾いていない光線が、ミサイル（発射前を含む）に重なったとき、次の 2 つを満たせば弾く。

- 光線の中心の x がミサイルの中心から ±2 px 以内（先端の中央、横幅 4 px）
- 前のステップで、光線の下端がミサイルの先端（y − 12）より上にあった（正面の上から来た）

弾いた光線は `vy = −90`、`reflected = true` にする。UFO・ミサイルには当たらず、天井を出たら消える。仕様書の「やや斜め」は、ミサイルが横に動いていても上の 2 つを満たせば弾く、と読む★。

### 6.4 UFO を倒したとき

ミサイルは消す（`isLaunched = false`、画面に出さない）。status を respawn（`waitReason = 'kill'`、`waitSteps = 120`）にし、1 秒後に出撃待ち（standby）にする。残機は減らさない。光線は撃たない（最上部を抜けたときと同じ）。倒した UFO の位置に `killEffect = { x, y, points, steps: 120 }` を置く。描き方は MGW-TD-0003 §6（初めの 48 ステップは爆発、残りは得点）。8 機目（クリア）のときは `killEffect` を置かない。

## 7. 得点（`scoring.ts`）

### 7.1 UFO の部位（UFO の中心からの四角）★

| 部位 | x | y | 得点（1 面） |
| :--- | :--- | :--- | :--- |
| 側面・上部（`body`） | −16〜16 | −12〜4 | 50 |
| 下部中央（`bottom`） | −6〜6 | 0〜8 | 100 |
| 突起（`prong`、2 か所） | −14〜−8・8〜14 | 4〜12 | 150 |

- ミサイルの四角が重なった部位のうち、得点のいちばん高いものを取る。
- UFO は画面の端で回るので、x の差は `((mx − ux + 240) mod 480) − 240` で求める。
- 600 点ボーナス：`killCount === 3`（4 機目）で突起に当てたら、150 点の **代わりに** 600 点★。
- 得点を足したら `killCount += 1`、`idleSteps = 0`。

### 7.2 増機

得点を足したあと、`extended` が false で `score >= EXTEND_SCORE`（1000）なら、`lives += 1`、`extended = true`。スコアは 99,999 で止める。

### 7.3 時間ボーナス（仕様書 v1.9）

- `playSteps` は、`step` の始まりの状態が playing のときだけ 1 足す（ready・respawn・standby・paused・cleared・gameOver では足さない）。一時停止の間は `step` が何もしないので、足されない。
- クリアが決まったステップで、`timeBonus = timeBonusOf(playSteps)` を求め、`score = min(SCORE_MAX, score + timeBonus)` にする。増機の判定（§7.2）には使わない。ゲームオーバーでは足さない（`timeBonus` は 0 のまま）。
- `timeBonusOf(steps) = max(0, TIME_BONUS_BASE − floor(steps ÷ 120)) × TIME_BONUS_PER_SEC`（`scoring.ts`）。
- 画面とランキングに出すタイムは、`clearTimeMs(steps) = floor(steps × 1000 ÷ 120 ÷ 100) × 100`（0.1 秒単位で切り捨てたミリ秒）。

## 8. 音の計画（`sound-plan.ts`）

前のステップと次のステップの状態を比べて、鳴らす音を決める。

| 条件 | 指示 |
| :--- | :--- |
| `isBoosting` が false → true（playing） | `jetOn` |
| `isBoosting` が true → false、または playing でなくなった | `jetOff` |
| `killCount` が増えた | `ufoDestroyed`（ミサイルが消えるので、噴射中なら `jetOff` も） |
| `extended` が false → true | `extend` |
| `waitReason` が `'miss'` になった | `miss` |

## 9. 単体テストで確かめること

- 定数・領域・初めの状態（MGW-US-0005〜0010、0016）
- 入力の列からの動き：発射、噴射の速さ、端で止まる（MGW-US-0006、0007）
- UFO の速さの表と回り込み、光線の規則・上限・盾（MGW-US-0008〜0010）
- 当たり判定の順、UFO を倒したらミサイルが消えて 1 秒待つこと、光線弾き（MGW-US-0011、0012、0016）
- 得点・600 点・増機・残機・待ち・ゲームオーバー・クリア・永久パターン防止・一時停止（MGW-US-0013、0016〜0020）
- 音の計画（MGW-US-0023）
- 時間ボーナス：式（境目の 179.99 秒・180 秒）、Playing の間だけ数えること、クリアで足し、ゲームオーバーでは足さないこと、増機に使わないこと（MGW-US-0013）
- 同じ種と同じ入力の列から同じ結果、60 Hz と 120 Hz の描画で同じ結果、`planSteps` の上限（MGW-US-0030）
- 出撃待ち：待ちのあと standby になり、`launch` で ready（x = 240）、そのステップでは発射しない、光線を撃たない、永久パターン防止は進む、一時停止から standby に戻る（MGW-US-0016、0018）
- 隕石の初めの並び：同じ種なら同じ、種が違えば変わる、となりどうしの間が 501.6 以上（MGW-US-0010）

## 10. 乱数（`random.ts`。仕様書 v1.7）

- `createRandom(seed)` は mulberry32（32 ビットの整数の足し算・掛け算・シフトだけの短い式）で作る。`Math.imul` と `>>> 0` を使い、どの端末でも同じ数の列になる。
- 種は app が決める（MGW-TD-0004）。core は種を受け取るだけで、`Math.random`・時刻には触れない（MGW-ADR-0001）。
- 乱数を使うのは、隕石の初めの並び（§5）だけ。ステップの中では使わない（入力の列の再現を簡単にするため）。

## 11. 改訂履歴

| 版 | 日付 | 内容 |
| :--- | :--- | :--- |
| 1.0 | 2026-10-26 | 初版 |
| 1.1 | 2026-10-27 | §2：`REGIONS`・`LAUNCHER_START_X` を足した。§4：`planSteps` で超えた分を捨てるときは積み上げを 0 にし、足し算の誤差の余裕を持つ（どちらも MGW-TASK-0005 の実装に合わせる） |
| 1.2 | 2026-10-27 | §6 の 9：待ちに入ったステップでは `waitSteps` を減らさない（ちょうど 2 秒・1 秒で戻るように。MGW-TASK-0009 の実装に合わせる） |
| 1.3 | 2026-10-28 | §2・§7.2：増機の点数を 3000 から 1000 にする（仕様書 v1.5、doc/requests/2026-10-27-spec-1.5-extend-score.md） |
| 1.4 | 2026-10-28 | 仕様書 v1.6：§2 の速さ（1/4、光線 1/2）・隕石 11 段・新しい定数、§3 の `waitReason` と `killEffect`、§5 の隕石の道のり、§6 の手順と §6.4（UFO を倒したらミサイルを消して 1 秒待つ）、§8 の音 |
| 1.5 | 2026-10-29 | 仕様書 v1.7：§2 の `METEOR_PATH_LENGTH`・`METEOR_MIN_GAP`、§3 の `standby`、§4 の `newGame` の種・`random.ts`、§5 の隕石の初めの並び、§6 の出撃待ち、§9 のテスト、§10 の乱数 |
| 1.6 | 2026-10-29 | 仕様書 v1.9：§2 の `TIME_BONUS_BASE`・`TIME_BONUS_PER_SEC`、§3 の `playSteps`・`timeBonus`、§7.3 時間ボーナス、§9 のテスト |
