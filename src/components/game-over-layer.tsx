import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";
import { squareToXY } from "../helpers/square-utils";
import type { BoardColors, GameOverLabels, GameResult } from "../types";

// Choreography (all ms, relative to startDelay). Grow pops a rounded
// square over the king's cell, hold lets the label pill breathe, settle
// shrinks the overlay into the persistent corner badge.
const GROW_MS = 300;
const HOLD_MS = 800;
const SETTLE_MS = 350;

// Sizes as fractions of one square.
const BADGE_FRACTION = 0.45;
const ICON_FRACTION = 0.58;

// The full-cell overlay is semi-transparent so the king stays visible
// under it; the fill animates to solid as it settles into the small
// corner badge (which sits over the piece's corner and reads better
// opaque).
const CELL_FILL_OPACITY = 0.8;

// Above every piece (pieces use 10/50/100 for rest/scaled/dragging),
// below the promotion dialog (200).
const LAYER_Z_INDEX = 150;

const EDGE_PAD = 2;

// "winner" and "draw" are visual variants on top of the loser-side
// reason variants; a draw puts the same badge on both kings.
type BadgeVariant =
  | "winner"
  | "draw"
  | "checkmate"
  | "resign"
  | "timeout"
  | "abandon";

const DEFAULT_LABELS: Record<string, string> = {
  winner: "Winner",
  checkmate: "Checkmate",
  stalemate: "Stalemate",
  draw: "Draw",
  resign: "Resigned",
  timeout: "Timeout",
  abandon: "Abandoned",
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function CrownIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.2 15.8 L3 6.8 l4.9 3.6 L12 3.8 l4.1 6.6 L21 6.8 l-1.2 9 Z"
        fill={color}
      />
      <Path d="M4.6 17.4 h14.8 v2.4 H4.6 Z" fill={color} />
    </Svg>
  );
}

function FallenKingIcon({ size, color }: { size: number; color: string }) {
  // Standard chess-king silhouette (cross, shoulders, base) with a
  // slight topple. A full 90° rotation stops reading as a king at
  // badge sizes, so the tilt stays subtle. Scaled so the tilted
  // extents stay inside the viewBox.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G rotation={22} origin="12, 12" scale={0.8}>
        <Path
          d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.74,10.77 8.42,10 7,10A4,4 0 0,0 3,14C3,15.86 4.28,17.43 6,17.87V19H18V17.87C19.72,17.43 21,15.86 21,14A4,4 0 0,0 17,10Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}

function FlagIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 2.4 h2.2 v19.2 H6 Z" fill={color} />
      <Path d="M8.2 3.6 H19.6 l-3 3.6 3 3.6 H8.2 Z" fill={color} />
    </Svg>
  );
}

function ClockIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={8.4}
        stroke={color}
        strokeWidth={2.4}
        fill="none"
      />
      <Path
        d="M12 7.2 V12 L15.4 14.2"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function CrossIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.6 6.2 6.2 4.6 12 10.4 17.8 4.6 19.4 6.2 13.6 12 19.4 17.8 17.8 19.4 12 13.6 6.2 19.4 4.6 17.8 10.4 12 Z"
        fill={color}
      />
    </Svg>
  );
}

function BadgeGlyph({
  variant,
  size,
  color,
}: {
  variant: BadgeVariant;
  size: number;
  color: string;
}) {
  switch (variant) {
    case "winner":
      return <CrownIcon size={size} color={color} />;
    case "checkmate":
      return <FallenKingIcon size={size} color={color} />;
    case "resign":
      return <FlagIcon size={size} color={color} />;
    case "timeout":
      return <ClockIcon size={size} color={color} />;
    case "abandon":
      return <CrossIcon size={size} color={color} />;
    case "draw":
      // The ½ glyph scales with the overlay transform like the SVGs do.
      return (
        <Text
          style={{
            color,
            fontWeight: "800",
            fontSize: size * 0.85,
            lineHeight: size,
          }}
        >
          ½
        </Text>
      );
  }
}

interface BadgeProps {
  variant: BadgeVariant;
  square: string;
  boardSize: number;
  flipped: boolean;
  colors: BoardColors;
  label: string;
  startDelay: number;
}

function KingBadge({
  variant,
  square,
  boardSize,
  flipped,
  colors,
  label,
  startDelay,
}: BadgeProps) {
  const pieceSize = boardSize / 8;
  const { x, y } = squareToXY(square, pieceSize, flipped);
  const badgeSize = pieceSize * BADGE_FRACTION;
  const fillColor =
    variant === "winner"
      ? colors.gameOverWinner
      : variant === "draw"
        ? colors.gameOverDraw
        : colors.gameOverLoser;

  // The settled badge is centered on the square's top-right corner,
  // clamped so it never leaves the board (kings on the h-file / back
  // ranks would otherwise push it outside).
  const badgeCX = clamp(
    x + pieceSize,
    badgeSize / 2 + EDGE_PAD,
    boardSize - badgeSize / 2 - EDGE_PAD
  );
  const badgeCY = clamp(
    y,
    badgeSize / 2 + EDGE_PAD,
    boardSize - badgeSize / 2 - EDGE_PAD
  );
  // Transform deltas from the overlay's natural center (cell center).
  const endTx = badgeCX - (x + pieceSize / 2);
  const endTy = badgeCY - (y + pieceSize / 2);
  const endScale = badgeSize / pieceSize;

  // Two separate phase values so each phase keeps its own easing and
  // the styles can combine them independently.
  const grow = useSharedValue(0);
  const settle = useSharedValue(0);

  useEffect(() => {
    grow.value = 0;
    settle.value = 0;
    // No overshoot easing here on purpose — scale must never exceed 1,
    // or the overlay would spill outside its board cell while popping.
    grow.value = withDelay(
      startDelay,
      withTiming(1, { duration: GROW_MS, easing: Easing.out(Easing.cubic) })
    );
    settle.value = withDelay(
      startDelay + GROW_MS + HOLD_MS,
      withTiming(1, { duration: SETTLE_MS, easing: Easing.inOut(Easing.cubic) })
    );
    return () => {
      cancelAnimation(grow);
      cancelAnimation(settle);
    };
  }, [square, variant, startDelay, grow, settle]);

  // The overlay is a full-cell view scaled/translated instead of
  // resized, so the icon shrinks with it for free. borderRadius is
  // rendered pre-scale: pieceSize/2 at endScale reads as a circle of
  // badgeSize.
  const overlayStyle = useAnimatedStyle(() => {
    const p = settle.value;
    return {
      opacity: grow.value > 0.01 ? 1 : 0,
      transform: [
        { translateX: interpolate(p, [0, 1], [0, endTx]) },
        { translateY: interpolate(p, [0, 1], [0, endTy]) },
        { scale: interpolate(p, [0, 1], [grow.value, endScale]) },
      ],
    };
  });

  // The colored fill lives on its own view so its translucency doesn't
  // fade the glyph, and firms up to solid as the overlay becomes the
  // corner badge. The cell state is a sharp square (radius 0) that
  // rounds into a circle only while settling.
  const fillStyle = useAnimatedStyle(() => {
    const p = settle.value;
    return {
      opacity: interpolate(p, [0, 1], [CELL_FILL_OPACITY, 1]),
      borderRadius: interpolate(p, [0, 1], [0, pieceSize / 2]),
    };
  });

  // Pill placement needs its measured width; opacity animates from 0
  // and the animation starts after startDelay, so the one-frame
  // pre-measure position is never visible.
  const [pillWidth, setPillWidth] = useState(0);
  const pillHeight = pieceSize * 0.52;
  const pillLeft = clamp(
    badgeCX - pillWidth / 2,
    EDGE_PAD,
    Math.max(EDGE_PAD, boardSize - pillWidth - EDGE_PAD)
  );
  const pillTop = clamp(
    y - pillHeight * 0.9,
    EDGE_PAD,
    boardSize - pillHeight - EDGE_PAD
  );

  const pillStyle = useAnimatedStyle(() => {
    const inP = interpolate(grow.value, [0.35, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: inP * (1 - settle.value),
      transform: [
        { translateY: (1 - inP) * pieceSize * 0.15 },
        { scale: 0.8 + 0.2 * inP },
      ],
    };
  });

  const iconSize = pieceSize * ICON_FRACTION;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: x,
            top: y,
            width: pieceSize,
            height: pieceSize,
            alignItems: "center",
            justifyContent: "center",
            zIndex: LAYER_Z_INDEX,
          },
          overlayStyle,
        ]}
      >
        <Animated.View
          style={[
            { ...StyleSheet.absoluteFillObject, backgroundColor: fillColor },
            fillStyle,
          ]}
        />
        <BadgeGlyph
          variant={variant}
          size={iconSize}
          color={colors.gameOverAccent}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}
        style={[
          {
            position: "absolute",
            left: pillLeft,
            top: pillTop,
            height: pillHeight,
            borderRadius: pillHeight / 2,
            paddingHorizontal: pieceSize * 0.24,
            backgroundColor:
              variant === "winner" ? colors.gameOverAccent : fillColor,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 3,
            zIndex: LAYER_Z_INDEX,
          },
          pillStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            color:
              variant === "winner"
                ? colors.gameOverWinner
                : colors.gameOverAccent,
            fontWeight: "700",
            fontSize: Math.max(10, pieceSize * 0.26),
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </>
  );
}

interface Props {
  boardSize: number;
  flipped: boolean;
  colors: BoardColors;
  result: GameResult;
  whiteKingSquare: string | null;
  blackKingSquare: string | null;
  /** Delay before the animation starts — lets the final move finish sliding. */
  startDelay: number;
  labels?: GameOverLabels;
}

/**
 * Game-over animation. Decisive results (checkmate,
 * resign, timeout, abandon) pop a reason badge over the losing king and
 * a winner badge over the other; draws and stalemate pop a ½ badge over
 * both kings. Each overlay holds, then settles into a small circular
 * corner badge that persists until the result clears (undo, reset, new
 * game, or the `gameResult` prop changing). Everything ignores pointer
 * events.
 */
const GameOverLayer = React.memo(function GameOverLayer({
  boardSize,
  flipped,
  colors,
  result,
  whiteKingSquare,
  blackKingSquare,
  startDelay,
  labels,
}: Props) {
  const labelFor = (key: string) =>
    labels?.[key as keyof GameOverLabels] ?? DEFAULT_LABELS[key];

  const shared = { boardSize, flipped, colors, startDelay };

  if (result.reason === "draw" || result.reason === "stalemate") {
    const label = labelFor(result.reason);
    return (
      <>
        {whiteKingSquare && (
          <KingBadge
            variant="draw"
            square={whiteKingSquare}
            label={label}
            {...shared}
          />
        )}
        {blackKingSquare && (
          <KingBadge
            variant="draw"
            square={blackKingSquare}
            label={label}
            {...shared}
          />
        )}
      </>
    );
  }

  if (!result.winner) {
    if (__DEV__) {
      console.warn(
        `[expo-chessboard] gameResult reason "${result.reason}" is decisive and requires a winner — no animation rendered.`
      );
    }
    return null;
  }

  const loserSquare =
    result.winner === "w" ? blackKingSquare : whiteKingSquare;
  const winnerSquare =
    result.winner === "w" ? whiteKingSquare : blackKingSquare;

  return (
    <>
      {loserSquare && (
        <KingBadge
          variant={result.reason}
          square={loserSquare}
          label={labelFor(result.reason)}
          {...shared}
        />
      )}
      {winnerSquare && (
        <KingBadge
          variant="winner"
          square={winnerSquare}
          label={labelFor("winner")}
          {...shared}
        />
      )}
    </>
  );
});

export default GameOverLayer;
