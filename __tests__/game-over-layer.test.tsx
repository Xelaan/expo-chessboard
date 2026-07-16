import React from "react";
import { render } from "@testing-library/react-native";
import GameOverLayer from "../src/components/game-over-layer";
import { DEFAULT_COLORS } from "../src/types";

// Flatten a possibly-nested style array into one object.
function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.flat(Infinity).filter(Boolean).map(flatten));
  }
  return (style ?? {}) as Record<string, unknown>;
}

function findViewsWithBackground(node: any, color: string, out: any[] = []): any[] {
  if (Array.isArray(node)) {
    node.forEach((child) => findViewsWithBackground(child, color, out));
    return out;
  }
  if (!node || typeof node !== "object") return out;
  const style = flatten(node.props?.style);
  if (style.backgroundColor === color) out.push(style);
  (node.children ?? []).forEach((child: any) => findViewsWithBackground(child, color, out));
  return out;
}

// Regression: the losing king's cell fill must be an explicitly-sized box.
// Sizing it with `absoluteFillObject` (inset-only, no width/height) makes it
// collapse to zero size — and vanish — under React Native 0.85's Yoga
// absolute-positioning errata, even though the glyph still shows.
it("gives the king-cell fill an explicit size so it can't collapse", () => {
  const boardSize = 320;
  const pieceSize = boardSize / 8;
  const tree = render(
    <GameOverLayer
      boardSize={boardSize}
      flipped={false}
      colors={DEFAULT_COLORS}
      result={{ reason: "checkmate", winner: "w" }}
      whiteKingSquare="e1"
      blackKingSquare="e8"
      startDelay={0}
    />
  );

  // The loser color is also used by the label pill, so match on the
  // full-cell fill specifically: an absolute box sized to the square.
  const styles = findViewsWithBackground(tree.toJSON(), DEFAULT_COLORS.gameOverLoser);
  const cellFill = styles.find(
    (s) => s.width === pieceSize && s.height === pieceSize
  );
  expect(cellFill).toBeDefined();
  expect(cellFill?.position).toBe("absolute");
});
