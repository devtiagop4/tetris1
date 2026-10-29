import GameManager from "./game-manager.js";

export default class Score {
  constructor() {
    this.totalPoints = 0;
    this.totalLines = 0;
    this.level = 1;
  }

  addCompletedLines(completedLines) {
    this.totalLines += completedLines;
    this.totalPoints += completedLines * completedLines;

    const newLevel = Math.floor(this.totalLines / 10) + 1;

    if (newLevel > this.level) {
      GameManager.levelUp(newLevel);
      this.level = newLevel;
    }
  }

  addDropBonus(dropHeight) {
    this.totalPoints += dropHeight;
  }

  draw() {
    const context = GameManager.context;
    const arena = GameManager.arena;

    context.save();
    context.textAlign = "center";

    if (GameManager.config.isMobile) {
      const x = 12;
      const y = 8;
      const width = GameManager.config.width - 24;
      const height = 72;
      const columnWidth = width / 3;

      context.fillStyle = "#252525";
      context.strokeStyle = "#cfcfcf";
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(x, y, width, height, 12);
      context.fill();
      context.stroke();

      const items = [
        ["SCORE", this.totalPoints],
        ["LEVEL", this.level],
        ["LINES", this.totalLines],
      ];

      items.forEach(([label, value], index) => {
        const centerX = x + columnWidth * index + columnWidth / 2;

        context.fillStyle = "#ffffff";
        context.font = "bold 14px sans-serif";
        context.fillText(label, centerX, y + 25);

        context.font = "bold 20px sans-serif";
        context.fillText(String(value), centerX, y + 53);
      });

      context.restore();
      return;
    }

    const squareSize = GameManager.config.squareSize;
    const width = 160;
    const height = 280;
    const x = arena.position.left - width - 40;
    const y = arena.position.top + 190;

    context.fillStyle = "#252525";
    context.strokeStyle = "#cfcfcf";
    context.lineWidth = 4;
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
    context.stroke();

    context.fillStyle = "#ffffff";
    context.font = "bold 20px sans-serif";
    context.fillText("SCORE", x + width / 2, y + 35);
    context.font = "24px sans-serif";
    context.fillText(String(this.totalPoints), x + width / 2, y + 68);

    context.font = "bold 20px sans-serif";
    context.fillText("LEVEL", x + width / 2, y + 120);
    context.font = "24px sans-serif";
    context.fillText(String(this.level), x + width / 2, y + 153);

    context.font = "bold 20px sans-serif";
    context.fillText("LINES", x + width / 2, y + 205);
    context.font = "24px sans-serif";
    context.fillText(String(this.totalLines), x + width / 2, y + 238);

    context.restore();
  }
}