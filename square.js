import GameManager from "./game-manager.js";

export default class Square {
    constructor(color) {
        this._color = color;
    }

    draw(x, y) {
        // Define a cor do quadrado
        GameManager.context.fillStyle = this._color;

        // Desenha o quadrado no canvas
        GameManager.context.fillRect(
            x,
            y,
            GameManager.config.squareSize,
            GameManager.config.squareSize
        );
    }
}
