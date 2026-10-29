import GameManager from "./game-manager.js";

export default class Arena {
  constructor() {
    this._columns = GameManager.config.columns;
    this._lines = GameManager.config.lines;
    this._width = this._columns * GameManager.config.squareSize;
    this._height = this._lines * GameManager.config.squareSize;
    this.isGameOver = false;
    this.highScore = 0;

    this.restartButton = document.createElement("button");
    this.restartButton.textContent = "Reiniciar";
    this.restartButton.style.cssText =
      "display:none; position:fixed; left:50%; top:60%; transform:translate(-50%,-50%); z-index:10; padding:10px 20px; cursor:pointer; font-size:16px; background:#ff4d4d; color:#fff; border:0; border-radius:5px;";
    this.restartButton.addEventListener("click", () => window.location.reload());
    document.body.appendChild(this.restartButton);

    this.position = {
      top: (GameManager.config.height - this._height) / 2,
      left: (GameManager.config.width - this._width) / 2,
    };

    this.backgroundImage = new Image();
    this.backgroundImage.src = "./img/fundo.jpg";

    this._squares = [...Array(this._lines)].map(() =>
      [...Array(this._columns)],
    );

    this.currentPiece = GameManager.tetrominoFactory.getTetromino();
    this.setCurrentPieceInitialPosition();

    this._currentPieceFallInterval = setInterval(
      () => this._currentPieceFall(),
      GameManager.config.initialPieceFallInMilliseconds,
    );
  }

  setCurrentPieceInitialPosition() {
    this.currentPiece.position = {
      x: Math.floor((this._columns - 4) / 2),
      y: 0,
    };
  }

  levelUp(newLevel) {
    clearInterval(this._currentPieceFallInterval);
    const interval =
      GameManager.config.initialPieceFallInMilliseconds *
      Math.pow(GameManager.config.pieceFallIntervalDecay, newLevel - 1);

    this._currentPieceFallInterval = setInterval(
      () => this._currentPieceFall(),
      interval,
    );
  }

  _currentPieceFall() {
    if (this.isGameOver || GameManager.inPause) return;

    if (!this.currentPiece.tryMoveDown()) {
      this.currentPiece.mergeToArena();
      GameManager.playSound?.("lock");

      const removedLines = this.removeCompletedLines();

      if (removedLines > 0) {
        GameManager.playSound?.("line");
      }

      GameManager.score.addCompletedLines(removedLines);

      if (this._squares[0].some(Boolean)) {
        const scoreAtual = GameManager.score.totalPoints;
        const recordeAnterior =
          Number(localStorage.getItem("tretis-recorde")) || 0;

        this.highScore = Math.max(scoreAtual, recordeAnterior);

        if (scoreAtual > recordeAnterior) {
          localStorage.setItem("tretis-recorde", String(scoreAtual));
          localStorage.setItem("tretis-novo-recorde", "true");
        }

        this.isGameOver = true;
        clearInterval(this._currentPieceFallInterval);
        this.restartButton.style.display = "block";
        GameManager.playSound?.("gameover");
        return;
      }

      this.currentPiece = GameManager.nextPieceQueue.pop();
      this.setCurrentPieceInitialPosition();
    }
  }

  isOutSideBoundaries(i, j, piece) {
    return (
      piece.position.y + j >= this._lines ||
      piece.position.x + i >= this._columns ||
      piece.position.x + i < 0
    );
  }

  conflicts(i, j, piece) {
    const y = piece.position.y + j;
    const x = piece.position.x + i;

    if (y < 0 || y >= this._lines || x < 0 || x >= this._columns) {
      return false;
    }

    return this._squares[y][x];
  }

  setSquare(row, column, square) {
    this._squares[row][column] = square;
  }

  draw() {
    const context = GameManager.context;

    if (this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
      context.drawImage(
        this.backgroundImage,
        0,
        0,
        GameManager.config.width,
        GameManager.config.height,
      );
    }

    context.fillStyle = "#000000";
    context.fillRect(
      this.position.left,
      this.position.top,
      this._width,
      this._height,
    );

    context.save();
    context.beginPath();
    context.rect(
      this.position.left,
      this.position.top,
      this._width,
      this._height,
    );
    context.clip();

    this._drawSquares();
    this._drawGrid();

    if (!this.isGameOver) {
      const ghostPiece = this.currentPiece.clone();

      while (ghostPiece.tryMoveDown()) {
        // Desce a cópia até a posição final possível.
      }

      ghostPiece.drawGhost();
      this.currentPiece.draw();
    } else {
      this._drawGameOver();
    }

    context.restore();
    this._drawBorder();
  }

  _drawGameOver() {
    const context = GameManager.context;
    const centerX = this.position.left + this._width / 2;
    const centerY = this.position.top + this._height / 2;

    context.save();
    context.fillStyle = "rgba(0, 0, 0, 0.78)";
    context.fillRect(
      this.position.left,
      this.position.top,
      this._width,
      this._height,
    );

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.font = "bold 28px sans-serif";
    context.fillText("GAME OVER", centerX, centerY - 45);
    context.font = "18px sans-serif";
    context.fillText(
      `Pontuação: ${GameManager.score.totalPoints}`,
      centerX,
      centerY,
    );
    context.fillText(`Recorde: ${this.highScore}`, centerX, centerY + 35);
    context.restore();
  }

  _drawBorder() {
    const context = GameManager.context;
    const padding = 10;
    const x = this.position.left - padding;
    const y = this.position.top - padding;
    const width = this._width + padding * 2;
    const height = this._height + padding * 2;

    context.save();
    context.lineWidth = 12;
    context.strokeStyle = "#d9d9d9";
    context.strokeRect(x, y, width, height);
    context.lineWidth = 3;
    context.strokeStyle = "#888888";
    context.strokeRect(x, y, width, height);
    context.restore();
  }

  _drawSquares() {
    for (let row = 0; row < this._lines; row++) {
      for (let column = 0; column < this._columns; column++) {
        const square = this._squares[row][column];

        if (square) {
          square.draw(
            this.position.left + column * GameManager.config.squareSize,
            this.position.top + row * GameManager.config.squareSize,
          );
        }
      }
    }
  }

  _drawGrid() {
    const context = GameManager.context;

    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.18)";
    context.lineWidth = 0.5;
    context.beginPath();

    for (let row = 1; row < this._lines; row++) {
      const y = this.position.top + GameManager.config.squareSize * row;
      context.moveTo(this.position.left, y);
      context.lineTo(this.position.left + this._width, y);
    }

    for (let column = 1; column < this._columns; column++) {
      const x = this.position.left + GameManager.config.squareSize * column;
      context.moveTo(x, this.position.top);
      context.lineTo(x, this.position.top + this._height);
    }

    context.stroke();
    context.restore();
  }

  removeCompletedLines() {
    const completedLines = [];

    for (let row = 0; row < this._lines; row++) {
      if (this._squares[row].every(Boolean)) {
        completedLines.push(row);
      }
    }

    for (let i = completedLines.length - 1; i >= 0; i--) {
      this._squares.splice(completedLines[i], 1);
    }

    for (let i = 0; i < completedLines.length; i++) {
      this._squares.unshift([...Array(this._columns)]);
    }

    return completedLines.length;
  }
}