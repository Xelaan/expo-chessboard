import React, { useEffect } from "react";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { squareToXY } from "../helpers/square-utils";
import type { BoardColors, SquareMark, SquareMarkIcon } from "../types";

// Entrance timing for a mark badge (a scale-up pop with a small overshoot,
// echoing the game-over badge's settle).
const POP_MS = 260;
// Badge diameter and glyph size as fractions of one square / the badge.
const MARK_FRACTION = 0.56;
const GLYPH_FRACTION = 0.52;
// Above every piece (pieces use 10/50/100 for rest/scaled/dragging), just
// below the game-over layer (150) so a game-over badge wins a shared square.
const LAYER_Z_INDEX = 140;

function MarkGlyph({
  icon,
  size,
  color,
}: {
  icon: SquareMarkIcon;
  size: number;
  color: string;
}) {
  // strokeWidth is in viewBox units (0–24); the glyph scales with `size` via
  // the Svg width/height, so a constant here keeps the stroke proportional.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icon === "check" ? (
        <Path
          d="M5 12.5 L10 17.5 L19 7"
          stroke={color}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : (
        <Path
          d="M7 7 L17 17 M17 7 L7 17"
          stroke={color}
          strokeWidth={2.8}
          strokeLinecap="round"
          fill="none"
        />
      )}
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
  const fill =
    mark.color ??
    (icon === "check" ? colors.gameOverWinner : colors.gameOverLoser);
  const accent = mark.accentColor ?? colors.gameOverAccent;

  const pieceSize = boardSize / 8;
  const { x, y } = squareToXY(mark.square, pieceSize, flipped);
  const badgeSize = pieceSize * MARK_FRACTION;
  const offset = (pieceSize - badgeSize) / 2;

  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = 0;
    pop.value = withTiming(1, {
      duration: POP_MS,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(pop);
  }, [mark.square, icon, pop]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(pop.value, [0, 0.35], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(pop.value, [0, 0.65, 1], [0, 1.12, 1]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x + offset,
          top: y + offset,
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: fill,
          alignItems: "center",
          justifyContent: "center",
          zIndex: LAYER_Z_INDEX,
        },
        style,
      ]}
    >
      <MarkGlyph icon={icon} size={badgeSize * GLYPH_FRACTION} color={accent} />
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
 * cross / check glyph — pinned over their squares, above the pieces. Each pops
 * in on mount; removing a mark from the array unmounts its badge.
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
