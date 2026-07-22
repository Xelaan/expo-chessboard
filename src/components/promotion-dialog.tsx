import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  type ImageSourcePropType,
} from "react-native";
import { DEFAULT_PIECES } from "../constants";
import type { Player, PieceType, BoardColors } from "../types";

interface Props {
  color: Player;
  boardSize: number;
  colors: BoardColors;
  /** Piece-image overrides, mirroring the board's `pieces` prop. */
  pieces?: Partial<Record<PieceType, ImageSourcePropType>>;
  /** Custom piece renderer, mirroring the board's `renderPiece` prop. */
  renderPiece?: (piece: PieceType, size: number) => React.ReactElement | null;
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
}

const PROMOTION_PIECES: ("q" | "r" | "b" | "n")[] = ["q", "r", "b", "n"];

export default function PromotionDialog({
  color,
  boardSize,
  colors,
  pieces,
  renderPiece,
  onSelect,
}: Props) {
  const pieceSize = boardSize / 8;
  const dialogWidth = pieceSize * 4;
  const pieceImageSize = pieceSize * 0.85;

  return (
    <View
      style={[
        s.overlay,
        {
          // Explicit board-sized frame (not absoluteFillObject): some hosts
          // resolve `bottom: 0` against the screen, not the board, which
          // pushes the flex-centred dialog below the board.
          position: "absolute",
          top: 0,
          left: 0,
          width: boardSize,
          height: boardSize,
          backgroundColor: colors.promotionOverlay,
        },
      ]}
    >
      {/* Centred via flexbox on the overlay (not absolute top/left): stays on
          the board regardless of how the overlay's frame resolves — some hosts
          (New Arch / nested absolutes) don't give the overlay the board frame. */}
      <View
        style={[
          s.dialog,
          {
            width: dialogWidth,
            borderRadius: pieceSize * 0.2,
            backgroundColor: colors.promotionDialogBackground,
          },
        ]}
      >
        {PROMOTION_PIECES.map((p) => {
          const key = `${color}${p}` as PieceType;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => onSelect(p)}
              style={[
                s.button,
                {
                  width: pieceSize,
                  height: pieceSize,
                  backgroundColor: colors.promotionPieceButton,
                },
              ]}
            >
              {renderPiece ? (
                renderPiece(key, pieceImageSize)
              ) : (
                <Image
                  source={pieces?.[key] ?? DEFAULT_PIECES[key]}
                  style={{ width: pieceImageSize, height: pieceImageSize }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    zIndex: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    flexDirection: "row",
    overflow: "hidden",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
});
