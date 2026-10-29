import GameManager from "./game-manager.js";

const config = {
    width: 960,
    height: 540,
    columns: 10,
    lines: 20,
    squareSize: 25,
    nextPieceQueueSize: 3,
    initialPieceFallInMilliseconds: 1000,
    pieceFallIntervalDecay: 0.9
};

GameManager.start(config);



