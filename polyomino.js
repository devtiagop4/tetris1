import GameManager from "./game-manager.js";
import Square from "./square.js";

export default class Polyomino {
  constructor(squaresCount, color, format) {
    this.color = color;
    this._squaresCount = squaresCount;
    this._initializeSquares(format);
  }

  _initializeSquares(format) {
    this._squares = [...Array(this._squaresCount)].map(() =>
      [...Array(this._squaresCount)],
    );

    for (let i = 0; i < this._squaresCount; i++) {
      for (let j = 0; j < this._squaresCount; j++) {
        if (format[i][j]) {
          const square = new Square(this.color);
          const originalDraw = square.draw.bind(square);

          square.draw = (x, y) => {
            originalDraw(x, y);
            this._drawBevel(x, y);
          };

          this._squares[i][j] = square;
        }
      }
    }
  }

  _drawBevel(x, y) {
    const context = GameManager.context;
    const size = GameManager.config.squareSize;
    const bevel = Math.max(2, size * 0.12);

    context.save();
    context.beginPath();
    context.rect(x, y, size, size);
    context.clip();

    context.fillStyle = "rgba(255, 255, 255, 0.58)";
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + size, y);
    context.lineTo(x + size - bevel, y + bevel);
    context.lineTo(x + bevel, y + bevel);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(255, 255, 255, 0.18)";
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + bevel, y + bevel);
    context.lineTo(x + bevel, y + size - bevel);
    context.lineTo(x, y + size);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(0, 0, 0, 0.22)";
    context.beginPath();
    context.moveTo(x + size, y);
    context.lineTo(x + size - bevel, y + bevel);
    context.lineTo(x + size - bevel, y + size - bevel);
    context.lineTo(x + size, y + size);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(0, 0, 0, 0.38)";
    context.beginPath();
    context.moveTo(x, y + size);
    context.lineTo(x + bevel, y + size - bevel);
    context.lineTo(x + size - bevel, y + size - bevel);
    context.lineTo(x + size, y + size);
    context.closePath();
    context.fill();

    context.restore();
  }

  draw() {
    for (let i = 0; i < this._squaresCount; i++) {
      for (let j = 0; j < this._squaresCount; j++) {
        if (this._squares[i][j]) {
          this._squares[i][j].draw(
            GameManager.arena.position.left +
              (this.position.x + i) * GameManager.config.squareSize,
            GameManager.arena.position.top +
              (this.position.y + j) * GameManager.config.squareSize,
          );
        }
      }
    }
  }

  drawGhost() {
    const context = GameManager.context;
    const size = GameManager.config.squareSize;

    context.save();
    context.fillStyle = "rgba(255, 255, 255, 0.12)";
    context.strokeStyle = "rgba(255, 255, 255, 0.55)";
    context.lineWidth = 1.5;

    for (let i = 0; i < this._squaresCount; i++) {
      for (let j = 0; j < this._squaresCount; j++) {
        if (!this._squares[i][j]) continue;

        const x =
          GameManager.arena.position.left +
          (this.position.x + i) * size;
        const y =
          GameManager.arena.position.top +
          (this.position.y + j) * size;

        context.fillRect(x + 2, y + 2, size - 4, size - 4);
        context.strokeRect(x + 2, y + 2, size - 4, size - 4);
      }
    }

    context.restore();
  }

  setPosition(x, y) {
    this.position = { x, y };
    return this;
  }

  clone() {
    return new Polyomino(
      this._squaresCount,
      this.color,
      this._squares.map((row) => row.map((square) => (square ? 1 : 0))),
    ).setPosition(this.position.x, this.position.y);
  }

  mergeToArena() {
    for (let i = 0; i < this._squaresCount; i++) {
      for (let j = 0; j < this._squaresCount; j++) {
        if (this._squares[i][j]) {
          GameManager.arena.setSquare(
            this.position.y + j,
            this.position.x + i,
            this._squares[i][j],
          );
        }
      }
    }
  }

  static validate(copy) {
    for (let i = 0; i < copy._squaresCount; i++) {
      for (let j = 0; j < copy._squaresCount; j++) {
        if (
          copy._squares[i][j] &&
          (GameManager.arena.isOutSideBoundaries(i, j, copy) ||
            GameManager.arena.conflicts(i, j, copy))
        ) {
          return false;
        }
      }
    }

    return true;
  }

  _tryMove(moveFn) {
    const copy = this.clone();
    moveFn(copy);

    if (!Polyomino.validate(copy)) return false;

    moveFn(this);
    return true;
  }

  tryMoveLeft() {
    return this._tryMove((piece) => piece.position.x--);
  }

  tryRotateAntiClockwise() {
    const copy = this.clone();

    for (let i = 0; i < this._squaresCount; i++) {
      for (let j = 0; j < this._squaresCount; j++) {
        copy._squares[i][j] =
          this._squares[this._squaresCount - j - 1][i];
      }
    }

    if (!Polyomino.validate(copy)) return false;

    for (let i = 0; i < this._squaresCount; i++) {
      for (let j = 0; j < this._squaresCount; j++) {
        this._squares[i][j] = copy._squares[i][j];
      }
    }

    return true;
  }

  tryMoveRight() {
    return this._tryMove((piece) => piece.position.x++);
  }

  tryMoveDown() {
    return this._tryMove((piece) => piece.position.y++);
  }
}