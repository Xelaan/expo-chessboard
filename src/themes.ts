import { DEFAULT_COLORS, type BoardColors } from "./types";

/**
 * Named theme presets. Pass any of these to the `colors` prop:
 *
 *   <Chessboard colors={THEME_WOOD} ... />
 *
 * Each theme is a complete `BoardColors` object — there's no inheritance
 * gymnastics. Consumers can still spread + override individual fields:
 *
 *   <Chessboard colors={{ ...THEME_BLUE, legalMoveDot: "red" }} ... />
 */

export const THEME_DEFAULT: BoardColors = DEFAULT_COLORS;

/** Warm wooden board reminiscent of a tournament set. */
export const THEME_WOOD: BoardColors = {
  light: "#f0d9b5",
  dark: "#b58863",
  lastMoveHighlight: "rgba(255, 255, 51, 0.45)",
  checkHighlight: "rgba(231, 76, 60, 0.55)",
  selectedSquare: "rgba(255, 255, 51, 0.5)",
  hoverSquare: "rgba(255, 255, 255, 0.32)",
  hoverRing: "rgba(255, 255, 255, 0.18)",
  legalMoveDot: "rgba(0, 0, 0, 0.18)",
  promotionPieceButton: "#b58863",
  promotionDialogBackground: "#fff",
  promotionOverlay: "rgba(0, 0, 0, 0.4)",
  arrow: "rgba(255, 170, 0, 0.85)",
  externalHighlight: "rgba(255, 170, 0, 0.6)",
  coordinateLight: "#b58863",
  coordinateDark: "#f0d9b5",
  premove: "rgba(231, 76, 60, 0.7)",
  premoveArrow: "rgba(231, 76, 60, 0.7)",
  gameOverLoser: "#fa412d",
  gameOverWinner: "#81b64c",
  gameOverDraw: "#8b8987",
  gameOverAccent: "#ffffff",
  boardBorder: "rgba(181, 136, 99, 0.75)",
};

/** Cool slate blue. */
export const THEME_BLUE: BoardColors = {
  light: "#dee3e6",
  dark: "#8ca2ad",
  lastMoveHighlight: "rgba(255, 255, 51, 0.4)",
  checkHighlight: "rgba(231, 76, 60, 0.55)",
  selectedSquare: "rgba(255, 255, 51, 0.5)",
  hoverSquare: "rgba(255, 255, 255, 0.32)",
  hoverRing: "rgba(255, 255, 255, 0.18)",
  legalMoveDot: "rgba(0, 0, 0, 0.18)",
  promotionPieceButton: "#8ca2ad",
  promotionDialogBackground: "#fff",
  promotionOverlay: "rgba(0, 0, 0, 0.4)",
  arrow: "rgba(255, 170, 0, 0.85)",
  externalHighlight: "rgba(255, 170, 0, 0.6)",
  coordinateLight: "#8ca2ad",
  coordinateDark: "#dee3e6",
  premove: "rgba(231, 76, 60, 0.7)",
  premoveArrow: "rgba(231, 76, 60, 0.7)",
  gameOverLoser: "#fa412d",
  gameOverWinner: "#81b64c",
  gameOverDraw: "#8b8987",
  gameOverAccent: "#ffffff",
  boardBorder: "rgba(140, 162, 173, 0.75)",
};

/** lichess-style green — same family as THEME_DEFAULT but tuned warmer. */
export const THEME_GREEN: BoardColors = {
  light: "#eeeed2",
  dark: "#769656",
  lastMoveHighlight: "rgba(255, 255, 51, 0.4)",
  checkHighlight: "rgba(231, 76, 60, 0.55)",
  selectedSquare: "rgba(255, 255, 51, 0.5)",
  hoverSquare: "rgba(255, 255, 255, 0.32)",
  hoverRing: "rgba(255, 255, 255, 0.18)",
  legalMoveDot: "rgba(0, 0, 0, 0.18)",
  promotionPieceButton: "#769656",
  promotionDialogBackground: "#fff",
  promotionOverlay: "rgba(0, 0, 0, 0.4)",
  arrow: "rgba(255, 170, 0, 0.85)",
  externalHighlight: "rgba(255, 170, 0, 0.6)",
  coordinateLight: "#769656",
  coordinateDark: "#eeeed2",
  premove: "rgba(231, 76, 60, 0.7)",
  premoveArrow: "rgba(231, 76, 60, 0.7)",
  gameOverLoser: "#fa412d",
  gameOverWinner: "#81b64c",
  gameOverDraw: "#8b8987",
  gameOverAccent: "#ffffff",
  boardBorder: "rgba(118, 150, 86, 0.75)",
};
