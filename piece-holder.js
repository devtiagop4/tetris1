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

    if (GameManager.config.isMobile) {
      const x = 12;
      const y = 8;
      const width = 150;
      const height = 124;

      this._drawPanel(context, x, y, width, height, "HOLD");

      if (this.holdingPiece) {
        const pieceX = x + width / 2 - squareSize * 2;
        const pieceY = y + 38;

        this.holdingPiece
          .setPosition(
            (pieceX - arena.position.left) / squareSize,
            (pieceY - arena.position.top) / squareSize,
          )
          .draw();
      }

      return;
    }

    const x =
      arena.position.left +
      GameManager.config.columns * squareSize -
      450;
    const y = arena.position.top + 10;

    this._drawPanel(context, x, y, 160, 160, "HOLD");

    if (this.holdingPiece) {
      this.holdingPiece.setPosition(-7, 2).draw();
    }
  }

  _drawPanel(context, x, y, width, height, title) {
    context.save();
    context.fillStyle = "#252525";
    context.strokeStyle = "#cfcfcf";
    context.lineWidth = 4;
    context.beginPath();
    context.roundRect(x, y, width, height, 14);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "bold 18px sans-serif";
    context.textAlign = "center";
    context.fillText(title, x + width / 2, y + 24);
    context.restore();
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

    const heldPiece = this.holdingPiece
      .clone()
      .setPosition(currentPiece.position.x, currentPiece.position.y);

    if (!Polyomino.validate(heldPiece)) return;

    GameManager.arena.currentPiece = heldPiece;
    this.holdingPiece = currentPiece;
    this.holdingPiece.setPosition(11, 14);
  }
}