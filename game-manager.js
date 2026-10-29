import Arena from "./arena.js";
import InputHandler from "./input-handler.js";
import NextPieceQueue from "./next-piece-queue.js";
import TetrominoFactory from "./tetromino-factory.js";
import Score from "./score.js";
import PauseScreen from "./pause-screen.js";
import PieceHolder from "./piece-holder.js";

export default class GameManager {
  static start(config) {
    GameManager.config = config;
    GameManager.inPause = false;
    GameManager.gameStarted = false;

    if (document.readyState === "complete") {
      GameManager._init();
    } else {
      window.addEventListener("load", () => GameManager._init(), {
        once: true,
      });
    }
  }

  static _init() {
    const canvas = document.getElementById("canvas");

    if (!canvas) {
      console.error('Canvas com id "canvas" não encontrado.');
      return;
    }

    canvas.width = GameManager.config.width;
    canvas.height = GameManager.config.height;
    GameManager.canvas = canvas;
    GameManager.context = canvas.getContext("2d");

    GameManager.logo = new Image();
    GameManager.logo.onerror = () => {
      console.error("Falha ao carregar o logo:", GameManager.logo.src);
    };
    GameManager.logo.src = new URL("./img/tetris.png", import.meta.url).href;

    canvas.addEventListener("click", (event) =>
      GameManager._handleCanvasClick(event),
    );

    GameManager._draw();
  }

  static _getCanvasPosition(event) {
    const rect = GameManager.canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (GameManager.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (GameManager.canvas.height / rect.height),
    };
  }

  static _handleCanvasClick(event) {
    const { x, y } = GameManager._getCanvasPosition(event);

    if (!GameManager.gameStarted) {
      const button = GameManager.playButton;

      if (
        button &&
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
      ) {
        GameManager._startGame();
      }

      return;
    }

    const button = GameManager.pauseButton;

    if (
      button &&
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      GameManager.togglePause();
    }
  }

  static togglePause() {
    if (!GameManager.gameStarted || GameManager.arena?.isGameOver) return;

    GameManager.inPause = !GameManager.inPause;
    GameManager.playSound?.("pause");
  }

  static _startGame() {
    if (GameManager.gameStarted) return;

    GameManager.gameStarted = true;
    localStorage.removeItem("tretis-novo-recorde");

    const mobileControls = document.getElementById("mobile-controls");
    if (mobileControls) mobileControls.hidden = false;

    GameManager.score = new Score();
    GameManager.pauseScreen = new PauseScreen();
    GameManager.pieceHolder = new PieceHolder();
    GameManager.tetrominoFactory = new TetrominoFactory();
    GameManager.nextPieceQueue = new NextPieceQueue(
      GameManager.config.nextPieceQueueSize,
    );
    GameManager.arena = new Arena();
    GameManager.inputHandler = new InputHandler();
  }

  static _draw() {
    const context = GameManager.context;

    context.clearRect(0, 0, GameManager.config.width, GameManager.config.height);

    if (!GameManager.gameStarted) {
      GameManager._drawStartScreen();
    } else {
      GameManager.arena.draw();
      GameManager.pieceHolder.draw();
      GameManager.score.draw();
      GameManager.nextPieceQueue.draw();
      GameManager.pauseScreen.draw();
      GameManager._drawPauseButton();
    }

    requestAnimationFrame(() => GameManager._draw());
  }

  static _drawPauseButton() {
    const context = GameManager.context;
    const button = {
      x: GameManager.config.width - 76,
      y: 12,
      width: 62,
      height: 36,
    };

    GameManager.pauseButton = button;

    context.save();
    context.fillStyle = "rgba(35, 35, 35, 0.9)";
    context.strokeStyle = "#eeeeee";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(button.x, button.y, button.width, button.height, 8);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "bold 15px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      GameManager.inPause ? "▶" : "Ⅱ",
      button.x + button.width / 2,
      button.y + button.height / 2,
    );
    context.restore();
  }

  static _drawStartScreen() {
    const context = GameManager.context;
    const width = GameManager.config.width;
    const height = GameManager.config.height;
    const panelWidth = 340;
    const panelHeight = 480;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#172554");
    background.addColorStop(0.5, "#312e81");
    background.addColorStop(1, "#581c87");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const drawBlock = (x, y, size, color) => {
      context.fillStyle = color;
      context.strokeStyle = "rgba(255,255,255,0.35)";
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(x, y, size, size, 6);
      context.fill();
      context.stroke();
    };

    drawBlock(75, 90, 34, "#22d3ee");
    drawBlock(110, 124, 34, "#3b82f6");
    drawBlock(75, 158, 34, "#a855f7");
    drawBlock(width - 110, 110, 34, "#facc15");
    drawBlock(width - 145, 144, 34, "#f97316");
    drawBlock(width - 110, 178, 34, "#22c55e");
    drawBlock(105, height - 130, 34, "#ef4444");
    drawBlock(width - 115, height - 145, 34, "#ec4899");

    context.save();
    context.shadowColor = "rgba(0,0,0,0.45)";
    context.shadowBlur = 24;
    context.shadowOffsetY = 8;
    context.fillStyle = "#20232b";
    context.strokeStyle = "#cbd5e1";
    context.lineWidth = 8;
    context.beginPath();
    context.roundRect(panelX, panelY, panelWidth, panelHeight, 28);
    context.fill();
    context.stroke();
    context.restore();

    context.textAlign = "center";

    if (GameManager.logo?.complete && GameManager.logo.naturalWidth > 0) {
      const maxLogoWidth = 190;
      const maxLogoHeight = 125;
      const scale = Math.min(
        maxLogoWidth / GameManager.logo.naturalWidth,
        maxLogoHeight / GameManager.logo.naturalHeight,
      );
      const logoWidth = GameManager.logo.naturalWidth * scale;
      const logoHeight = GameManager.logo.naturalHeight * scale;

      context.drawImage(
        GameManager.logo,
        width / 2 - logoWidth / 2,
        panelY + 15,
        logoWidth,
        logoHeight,
      );
    } else {
      context.fillStyle = "#ffffff";
      context.font = "bold 58px sans-serif";
      context.fillText("TETRIS", width / 2, panelY + 105);
    }

    context.fillStyle = "#cbd5e1";
    context.font = "19px sans-serif";
    context.fillText("Prepare-se para jogar", width / 2, panelY + 180);

    const button = {
      x: width / 2 - 105,
      y: panelY + 215,
      width: 210,
      height: 58,
    };
    GameManager.playButton = button;

    const buttonGradient = context.createLinearGradient(
      0,
      button.y,
      0,
      button.y + button.height,
    );
    buttonGradient.addColorStop(0, "#4ade80");
    buttonGradient.addColorStop(1, "#15803d");

    context.fillStyle = buttonGradient;
    context.strokeStyle = "#bbf7d0";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(button.x, button.y, button.width, button.height, 14);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "bold 30px sans-serif";
    context.fillText("JOGAR", width / 2, button.y + 39);

    const controlsX = panelX + 35;
    const controlsY = panelY + 285;
    const controlsWidth = panelWidth - 70;
    const controlsHeight = 120;

    context.fillStyle = "#303541";
    context.beginPath();
    context.roundRect(
      controlsX,
      controlsY,
      controlsWidth,
      controlsHeight,
      12,
    );
    context.fill();

    context.fillStyle = "#ffffff";
    context.font = "bold 19px sans-serif";
    context.fillText("CONTROLES", width / 2, controlsY + 35);
    context.font = "16px sans-serif";
    context.fillText("← → mover   ↑ girar", width / 2, controlsY + 70);
    context.fillText("↓ descer   Espaço: queda rápida", width / 2, controlsY + 100);

    const recorde = Number(localStorage.getItem("tretis-recorde")) || 0;
    const novoRecorde =
      localStorage.getItem("tretis-novo-recorde") === "true";

    context.fillStyle = novoRecorde ? "#facc15" : "#cbd5e1";
    context.font = "bold 16px sans-serif";
    context.fillText(
      novoRecorde ? `NOVO RECORDE! ${recorde}` : `RECORDE: ${recorde}`,
      width / 2,
      panelY + 455,
    );
  }

  static levelUp(newLevel) {
    GameManager.arena.levelUp(newLevel);
  }
}