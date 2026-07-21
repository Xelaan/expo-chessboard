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
  const dialogHeight = pieceSize;
  const pieceImageSize = pieceSize * 0.85;

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        s.overlay,
        { backgroundColor: colors.promotionOverlay },
      ]}
    >
      {/* Anchored to the board's centre explicitly, so the dialog stays put
          regardless of how the overlay's frame resolves. */}
      <View
        style={[
          s.dialog,
          {
            top: (boardSize - dialogHeight) / 2,
            left: (boardSize - dialogWidth) / 2,
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
  },
  dialog: {
    position: "absolute",
    flexDirection: "row",
    overflow: "hidden",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
});
