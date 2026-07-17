# Changelog

All notable changes to `@crewbeat/expo-chessboard` are documented here.
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.5.1 — Square marks match the game-over badge

### Changed

- **`marks` now animate like the game-over badge.** A `SquareMark` pops as a
  full-cell fill over the piece, holds, then settles into a small opaque circle
  on the square's **top-right corner** — the same choreography and geometry as
  the settled game-over badge (previously a smaller centered pop). Filled
  check / cross glyphs match the game-over glyph style.

## 0.5.0 — Configurable square marks + separate premove arrow color

### Added

- **`marks` prop — animated square badges.** Pass `SquareMark[]` to pin a
  colored circle with a glyph over a square, drawn above the pieces and
  popping in like the settled game-over badge. Each mark takes an `icon`
  (`"cross"` | `"check"`, default `"cross"`), and optional `color` /
  `accentColor` overrides — defaults are `gameOverLoser` (cross) /
  `gameOverWinner` (check) with the `gameOverAccent` glyph. Built for puzzle
  feedback (a red ✕ on a wrong move). New exports: `SquareMark`,
  `SquareMarkIcon`.
- **`colors.premoveArrow`.** The queued-premove arrow now has its own color,
  separate from `colors.premove` (which still tints the origin/destination
  rings). Defaults to the same value as `premove`, so existing themes are
  unchanged.

## 0.4.1 — Fix invisible game-over cell fill on React Native 0.85

### Fixed

- **Game-over cell fill not rendering.** The colored square/badge behind
  each king's game-over glyph was sized with `StyleSheet.absoluteFillObject`
  (inset-only, no width/height). Under React Native 0.85's Yoga
  absolute-positioning errata, an inset-only absolute child inside the
  flex-centered overlay collapses to zero size, so the fill vanished while
  the (explicitly sized) glyph still showed — for every theme. The fill is
  now pinned to the cell's `width`/`height`, so it renders across RN
  versions. Worked on RN 0.81 (the example app), regressed on 0.85.

## 0.4.0 — Configurable game-over accent color

### Added

- **`colors.gameOverAccent`** (default `#ffffff`) replaces the hardcoded
  whites in the game-over animation: badge glyphs (crown, fallen king,
  flag, clock, ✕, ½), the label text on colored pills, and the winner
  pill's background. Together with `gameOverLoser` / `gameOverWinner` /
  `gameOverDraw`, every color in the animation is now themeable.

## 0.3.0 — Board frame

### Added

- **Board frame.** New `boardPadding` prop (default 0) insets the 8×8
  grid from the board edges; the frame between them is painted with the
  new `colors.boardBorder` (semi-transparent dark by default), and a
  `backgroundImage` extends behind it. The component footprint stays
  `boardSize`.

## 0.2.0 — Game-over animations, board textures, worklets packaging fix

### Fixed

- **Worklets version-mismatch crash.** `dist/` no longer ships pre-compiled
  worklets (reverts the 0.1.2 build change). Baked worklets embed the Babel
  plugin's serialization format, which must match the consumer app's
  `react-native-worklets` runtime — apps on any other version crashed with
  "Mismatch between JavaScript code version and Worklets Babel plugin
  version". The library now ships inert `"worklet"` directives and lets the
  app's own Babel plugin compile them (Metro processes `node_modules`), the
  same packaging as gesture-handler and moti. The read-only-board bug that
  motivated 0.1.2 was actually the gesture-layer absolute-fill collapse,
  fixed separately in 0.1.3.

### Added

- **Game-over animation.** Animated king-cell badges when the game ends:
  the overlay pops over the king's square with a label pill, holds, then
  settles into a persistent corner badge. Checkmate (fallen king + crown
  for the winner), stalemate and draws (½ on both kings) are auto-detected
  from the position; resign (flag), timeout (clock), and abandon (✕) are
  declared via the new `gameResult` prop. New props
  `gameOverAnimationEnabled`, `gameOverLabels`, `gameResult`; new colors
  `gameOverLoser`, `gameOverWinner`, `gameOverDraw`; new exported types
  `GameResult`, `GameOverReason`, `GameOverLabels`. Overlays render above
  the pieces with a semi-transparent cell fill, and settle into opaque
  corner badges.

- **Board background image.** New `backgroundImage` prop renders an
  image (wood grain, marble, …) underneath the board cells, stretched to
  cover the board. Pair it with rgba `colors.light` / `colors.dark` so
  the texture shows through.

## 0.1.2 — Pre-compiled worklets (bug fix)

Fixes boards rendering **read-only** in consumer apps. The previous build
used `tsc` only, which left Reanimated `"worklet"` directives untransformed,
so gesture callbacks and `useAnimatedStyle` animations never ran on the UI
thread. The library now compiles its JS with Babel + `react-native-worklets/plugin`
(tsc still emits the type declarations), so `dist/` ships fully-formed
worklets — the same way gesture-handler and reanimated package theirs. Worklets
are compiled against `react-native-worklets` 0.10 / Reanimated 4 to match
current Expo SDK 56 apps. No API changes.

## 0.1.1 — Fork release

Republished under the `@crewbeat` scope from the `Xelaan/expo-chessboard`
fork. No code changes from 0.1.0 — only package name, repository
metadata, and documentation. Original library by og-nav.

## 0.1.0 — Initial release

First public release. Extracted and rebuilt from a working in-app
implementation, with twelve audited bugs fixed during the port and a
broader public API.

### Features

- **Animated piece movement.** Drag-and-drop and tap-to-move both
  driven by a single full-board `Pan` gesture; pieces slide between
  squares using Reanimated shared values on the UI thread.
- **Smart piece reconciliation.** Castling animates both the king and
  the rook. En passant removes the captured pawn cleanly. Captures
  reuse the capturing piece's React key so it slides onto the target
  square instead of popping.
- **Promotion animation.** Promoting pawns slide *and* morph into the
  selected piece in a single animation, instead of popping at the
  destination.
- **Controlled and uncontrolled modes.** Pass a `chess.ts` instance for
  full control, or just a `fen` string and let the board own its own
  internal `Chess`.
- **Premoves.** Set `premovesEnabled` and the player can queue a move
  during the opponent's turn; it auto-executes when it becomes legal,
  or clears silently if the opponent's move makes it illegal.
- **Move-history scrubbing.** Imperative `undo()` / `redo()` /
  `goToMoveIndex(n)` ref methods animate pieces backward and forward
  through `chess.ts` history. Foundation for variation trees in v0.2.
- **Full customization surface:**
  - `pieces` — partial map to override individual PNG assets
  - `renderPiece(piece, size)` — render any React node per piece
    (unicode glyphs, SVGs, custom assets)
  - `colors` — full board palette + theme presets
    (`THEME_DEFAULT`, `THEME_WOOD`, `THEME_BLUE`, `THEME_GREEN`)
  - `boardOrientation` (visual flip) and `playerSide` (interaction
    restriction) split apart so you can render an "I'm watching black"
    view or an analysis-mode `playerSide="both"` board
  - `showCoordinates`, `coordinateStyle`
  - `highlightedSquares` — external ring/fill overlays for puzzle
    annotations
  - `arrows` — SVG arrow overlay layer
  - `onSquarePress` — fires on every square tap, even empty ones
  - `soundEnabled`, `hapticsEnabled`
- **Imperative ref API:** `animateMove`, `syncFromChess`, `getFen`,
  `reset`, `undo`, `redo`, `goToMoveIndex`, `getMoveIndex`,
  `getHistory`, `canUndo`, `canRedo`, `cancelPremove`.

### Engineering

- **Migrated to `expo-audio`.** The earlier in-app implementation used
  the deprecated `expo-av`; this version uses `useAudioPlayer` and
  `setAudioModeAsync({ playsInSilentMode: true, interruptionMode:
  "mixWithOthers" })` so mounting the chessboard does not pause the
  user's music.
- **Reconciliation extracted into a pure helper.** The piece-key reuse
  algorithm lives in `helpers/reconcile-pieces.ts` so it can be
  unit-tested without React, Reanimated, or jsdom.
- **Plain `tsc` build to `dist/`.** No bundler. Asset `require()` paths
  are relative and survive the emit.
- **Peer-dep model.** `react`, `react-native`, `react-native-reanimated
  >=3`, `react-native-gesture-handler >=2`, `react-native-svg >=15`,
  `chess.ts >=0.16`, `expo-audio`, `expo-haptics`. Nothing bundled.

### Known limitations

- The promotion picker is a centered modal, not yet positioned over
  the destination file.
- Setup mode (drop any piece anywhere) is deferred to v0.2.
- The redo stack is single-line; multi-line variation trees are
  deferred to v0.2 (the redo stack is the foundation).
- Web support is whatever `react-native-web` gives for free; not
  explicitly tested.
