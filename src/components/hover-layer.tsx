import React from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { squareToXY } from "../helpers/square-utils";
import type { BoardColors } from "../types";

interface Props {
  boardSize: number;
  flipped: boolean;
  colors: BoardColors;
  /** Cell the dragged piece currently hovers over (null when not dragging). */
  hoverSquare: SharedValue<string | null>;
}

// Diameter of the surrounding disc, as a multiple of one square.
const RING_SCALE = 1.7;

/**
 * Drag affordance drawn beneath the pieces: a fill on the hovered cell plus
 * a larger semi-transparent disc centered on it, so the drop target reads
 * clearly while a piece is in hand. Both snap cell-to-cell — the gesture
 * layer drives `hoverSquare` from the (lifted) drag position, so the
 * highlighted cell is exactly where the piece would land.
 */
const HoverLayer = React.memo(function HoverLayer({
  boardSize,
  flipped,
  colors,
  hoverSquare,
}: Props) {
  const pieceSize = boardSize / 8;
  const ringSize = pieceSize * RING_SCALE;
  // Constant inset that centers the ring on the cell it sits over.
  const ringInset = (pieceSize - ringSize) / 2;

  const fillStyle = useAnimatedStyle(() => {
    const sq = hoverSquare.value;
    if (!sq) return { opacity: 0 };
    const { x, y } = squareToXY(sq, pieceSize, flipped);
    return { opacity: 1, left: x, top: y };
  });

  const ringStyle = useAnimatedStyle(() => {
    const sq = hoverSquare.value;
    if (!sq) return { opacity: 0 };
    const { x, y } = squareToXY(sq, pieceSize, flipped);
    return { opacity: 1, left: x + ringInset, top: y + ringInset };
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            backgroundColor: colors.hoverRing,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: pieceSize,
            height: pieceSize,
            backgroundColor: colors.hoverSquare,
          },
          fillStyle,
        ]}
      />
    </>
  );
});

export default HoverLayer;
