import GameManager from "./game-manager.js";

export default class PauseScreen {
  draw() {
    if (!GameManager.inPause) return;

    const context = GameManager.context;
    const width = GameManager.config.width;
    const height = GameManager.config.height;

    context.save();
    context.fillStyle = "rgba(0, 0, 0, 0.68)";
    context.fillRect(0, 0, width, height);

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.font = "bold 48px 'Titillium Web', sans-serif";
    context.fillText("PAUSADO", width / 2, height / 2 - 12);

    context.font = "18px 'Titillium Web', sans-serif";
    context.fillText(
      "Toque no botão ▶ ou pressione Esc para continuar",
      width / 2,
      height / 2 + 35,
    );
    context.restore();
  }
}