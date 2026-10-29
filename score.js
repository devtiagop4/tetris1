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
    const squareSize = GameManager.config.squareSize;

    context.save();
    context.fillStyle = "#252525";
    context.strokeStyle = "#cfcfcf";
    context.lineWidth = 4;
    context.textAlign = "center";

    if (GameManager.config.isMobile) {
      const x = 12;
      const y = GameManager.config.height - 104;
      const width = GameManager.config.width - 24;
      const height = 92;
      const columnWidth = width / 3;

      context.beginPath();
      context.roundRect(x, y, width, height, 14);
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
        context.font = "bold 15px sans-serif";
        context.fillText(label, centerX, y + 32);

        context.font = "bold 21px sans-serif";
        context.fillText(String(value), centerX, y + 65);
      });

      context.restore();
      return;
    }

    const y = arena.position.top + 190;
    const width = 160;
    const height = 280;
    const x = arena.position.left - width - 40;

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