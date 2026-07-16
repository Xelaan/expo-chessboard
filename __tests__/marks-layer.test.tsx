import React from "react";
import { render } from "@testing-library/react-native";
import MarksLayer from "../src/components/marks-layer";
import { DEFAULT_COLORS } from "../src/types";

function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.flat(Infinity).filter(Boolean).map(flatten));
  }
  return (style ?? {}) as Record<string, unknown>;
}

function badgesWithBackground(node: any, color: string, out: any[] = []): any[] {
  if (Array.isArray(node)) {
    node.forEach((child) => badgesWithBackground(child, color, out));
    return out;
  }
  if (!node || typeof node !== "object") return out;
  const style = flatten(node.props?.style);
  if (style.backgroundColor === color && typeof style.width === "number") {
    out.push(style);
  }
  (node.children ?? []).forEach((child: any) => badgesWithBackground(child, color, out));
  return out;
}

it("renders a round, cell-sized cross badge using the loser color by default", () => {
  const boardSize = 320;
  const tree = render(
    <MarksLayer
      boardSize={boardSize}
      flipped={false}
      colors={DEFAULT_COLORS}
      marks={[{ square: "e4", icon: "cross" }]}
    />
  );

  const badges = badgesWithBackground(tree.toJSON(), DEFAULT_COLORS.gameOverLoser);
  expect(badges).toHaveLength(1);
  const badge = badges[0];
  // Round (borderRadius = radius) and a fraction of one square (320/8 = 40).
  expect(badge.borderRadius).toBe((badge.width as number) / 2);
  expect(badge.width).toBeGreaterThan(0);
  expect(badge.width).toBeLessThan(40);
});

it("uses the winner color for a check mark and honors a per-mark color override", () => {
  const tree = render(
    <MarksLayer
      boardSize={320}
      flipped={false}
      colors={DEFAULT_COLORS}
      marks={[
        { square: "d5", icon: "check" },
        { square: "a1", icon: "cross", color: "#123456" },
      ]}
    />
  );
  const json = tree.toJSON();
  expect(badgesWithBackground(json, DEFAULT_COLORS.gameOverWinner)).toHaveLength(1);
  expect(badgesWithBackground(json, "#123456")).toHaveLength(1);
});
