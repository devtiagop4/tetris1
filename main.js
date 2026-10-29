import GameManager from "./game-manager.js";

const isMobile = window.matchMedia("(max-width: 600px)").matches;

const config = {
  width: isMobile ? 420 : 960,
  height: isMobile ? 800 : 540,
  columns: 10,
  lines: 20,
  squareSize: isMobile ? 26 : 25,
  nextPieceQueueSize: 3,
  initialPieceFallInMilliseconds: 1000,
  pieceFallIntervalDecay: 0.9,
  isMobile,
};

GameManager.start(config);