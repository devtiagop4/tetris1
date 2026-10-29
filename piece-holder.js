import GameManager from "./game-manager.js";
import Polyomino from "./polyomino.js";

export default class PieceHolder {
  constructor() {
    this.holdingPiece = null;
  }

   draw() {
    const context = GameManager.context;
    const arena = GameManager.arena;
    const squareSize = GameManager.config.squareSize;
    const x = arena.position.left + GameManager.config.columns * squareSize - 450;
    const y = arena.position.top + 10;
    const width = 160;
    const height = 160;

    context.save();

    context.fillStyle = "#252525";
    context.strokeStyle = "#cfcfcf";
    context.lineWidth = 5;
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "bold 22px sans-serif";
    context.textAlign = "center";
    context.fillText("HOLD", x + width / 2, y + 32);

    context.restore();

    if (this.holdingPiece) {
      this.holdingPiece.setPosition(-7, 2).draw();
    }
  }

  hold() {
    const currentPiece = GameManager.arena.currentPiece.clone();

    if (!this.holdingPiece) {
        this.holdingPiece = currentPiece;
        this.holdingPiece.setPosition(11, 14);

        GameManager.arena.currentPiece = GameManager.nextPieceQueue.pop();
        GameManager.arena.setCurrentPieceInitialPosition();
        return; 
    }

    const holdingPieceAtCurrentPiecePosition = this.holdingPiece.clone().setPosition(currentPiece.position.x, currentPiece.position.y);
    if (!Polyomino.validate(holdingPieceAtCurrentPiecePosition)) {
        return;
    }

    GameManager.arena.currentPiece = holdingPieceAtCurrentPiecePosition;

        this.holdingPiece = currentPiece;
        this.holdingPiece.setPosition(11, 14);
  }
}
