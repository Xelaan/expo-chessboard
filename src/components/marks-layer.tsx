import React, { useEffect } from "react";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { squareToXY } from "../helpers/square-utils";
import type { BoardColors, SquareMark, SquareMarkIcon } from "../types";

// Choreography mirrors the game-over badge (game-over-layer.tsx): the badge
// pops as a full-cell fill over the piece, holds, then settles into a small
// opaque circle on the square's top-right corner.
const GROW_MS = 300;
const HOLD_MS = 800;
const SETTLE_MS = 350;
const BADGE_FRACTION = 0.45;
const ICON_FRACTION = 0.58;
const CELL_FILL_OPACITY = 0.8;
const EDGE_PAD = 2;
// Above every piece (pieces use 10/50/100 for rest/scaled/dragging), just
// below the game-over layer (150) so a game-over badge wins a shared square.
const LAYER_Z_INDEX = 140;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

// Filled glyphs matching the game-over badge's style (Material check / close).
function MarkGlyph({
  icon,
  size,
  color,
}: {
  icon: SquareMarkIcon;
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={
          icon === "check"
            ? "M9 16.17 L4.83 12 L3.41 13.41 L9 19 L21 7 L19.59 5.59 Z"
            : "M19 6.41 L17.59 5 L12 10.59 L6.41 5 L5 6.41 L10.59 12 L5 17.59 L6.41 19 L12 13.41 L17.59 19 L19 17.59 L13.41 12 Z"
        }
        fill={color}
      />
    </Svg>
  );
}

interface MarkBadgeProps {
  mark: SquareMark;
  boardSize: number;
  flipped: boolean;
  colors: BoardColors;
}

function MarkBadge({ mark, boardSize, flipped, colors }: MarkBadgeProps) {
  const icon = mark.icon ?? "cross";
  const fillColor =
    mark.color ??
    (icon === "check" ? colors.gameOverWinner : colors.gameOverLoser);
  const accent = mark.accentColor ?? colors.gameOverAccent;

  const pieceSize = boardSize / 8;
  const { x, y } = squareToXY(mark.square, pieceSize, flipped);
  const badgeSize = pieceSize * BADGE_FRACTION;

  // Settled badge centred on the square's top-right corner, clamped so an
  // edge/corner square never pushes it off the board.
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
  const endTx = badgeCX - (x + pieceSize / 2);
  const endTy = badgeCY - (y + pieceSize / 2);
  const endScale = badgeSize / pieceSize;
  const iconSize = pieceSize * ICON_FRACTION;

  const grow = useSharedValue(0);
  const settle = useSharedValue(0);
  useEffect(() => {
    grow.value = 0;
    settle.value = 0;
    grow.value = withTiming(1, {
      duration: GROW_MS,
      easing: Easing.out(Easing.cubic),
    });
    settle.value = withDelay(
      GROW_MS + HOLD_MS,
      withTiming(1, { duration: SETTLE_MS, easing: Easing.inOut(Easing.cubic) })
    );
    return () => {
      cancelAnimation(grow);
      cancelAnimation(settle);
    };
  }, [mark.square, icon, grow, settle]);

  // The overlay scales/translates from a full cell into the corner badge; the
  // glyph rides along for free.
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

  // Its own view so the translucency doesn't fade the glyph; firms up to solid
  // and rounds from a square into a circle as it settles.
  const fillStyle = useAnimatedStyle(() => {
    const p = settle.value;
    return {
      opacity: interpolate(p, [0, 1], [CELL_FILL_OPACITY, 1]),
      borderRadius: interpolate(p, [0, 1], [0, pieceSize / 2]),
    };
  });

  return (
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
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: pieceSize,
            height: pieceSize,
            backgroundColor: fillColor,
          },
          fillStyle,
        ]}
      />
      <MarkGlyph icon={icon} size={iconSize} color={accent} />
    </Animated.View>
  );
}

interface Props {
  marks: SquareMark[];
  boardSize: number;
  flipped: boolean;
  colors: BoardColors;
}

/**
 * Renders {@link SquareMark} badges — configurable colored circles with a
 * cross / check glyph — using the same pop-then-settle animation as the
 * game-over badge. Each pops in on mount; removing a mark unmounts its badge.
 */
const MarksLayer = React.memo(function MarksLayer({
  marks,
  boardSize,
  flipped,
  colors,
}: Props) {
  return (
    <>
      {marks.map((mark) => (
        <MarkBadge
          key={mark.square}
          mark={mark}
          boardSize={boardSize}
          flipped={flipped}
          colors={colors}
        />
      ))}
    </>
  );
});

export default MarksLayer;
