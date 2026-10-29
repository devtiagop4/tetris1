import GameManager from "./game-manager.js";

export default class NextPieceQueue {
  constructor(queueSize) {
    this._next = [];
    for (let i = 0; i < queueSize; i++) {
      this._next.push(GameManager.tetrominoFactory.getTetromino());
    }
  }

  pop() {
    this._next.push(GameManager.tetrominoFactory.getTetromino());
    const piece = this._next[0];
    this._next = this._next.splice(1);
    return piece;
  }

  draw() {
    const context = GameManager.context;
    const arena = GameManager.arena;
    const squareSize = GameManager.config.squareSize;
    const x = arena.position.left + GameManager.config.columns * squareSize + 40;
    const y = arena.position.top + 10;
    const width = 155;
    const height = 470;

    context.save();

    context.fillStyle = "#252525";
    context.strokeStyle = "#cfcfcf";
    context.lineWidth = 5;
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "bold 24px sans-serif";
    context.textAlign = "center";
    context.fillText("NEXT", x + width / 2, y - 8);

    context.restore();

    for (let i = 0; i < this._next.length; i++) {
      this._next[i].setPosition(12, 2 + 5 * i).draw();
    }
  }
}