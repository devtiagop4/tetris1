import GameManager from "./game-manager.js";

export default class InputHandler {
  constructor() {
    this.audioContext = null;

    GameManager.playSound = (effect) => this._playSound(effect);

    document.addEventListener("keydown", (event) => this.onKeyDown(event));

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        this.performAction(button.dataset.action);
      });
    });
  }

  _getAudioContext() {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return null;

      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  _playSound(effect) {
    const audio = this._getAudioContext();
    if (!audio) return;

    const sounds = {
      move: [420],
      rotate: [620],
      drop: [180, 130],
      lock: [260],
      hold: [520, 390],
      line: [523, 659, 784],
      pause: [440, 330],
      gameover: [392, 294, 196],
    };

    const notes = sounds[effect];
    if (!notes) return;

    notes.forEach((frequency, index) => {
      const startTime = audio.currentTime + index * 0.11;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.13);
    });
  }

  performAction(action) {
    if (!GameManager.gameStarted || !GameManager.arena) return;
    if (GameManager.arena.isGameOver) return;

    if (action === "pause") {
      GameManager.togglePause();
      return;
    }

    if (GameManager.inPause) return;

    const piece = GameManager.arena.currentPiece;

    switch (action) {
      case "left":
        if (piece.tryMoveLeft()) GameManager.playSound("move");
        break;

      case "right":
        if (piece.tryMoveRight()) GameManager.playSound("move");
        break;

      case "down":
        if (piece.tryMoveDown()) GameManager.playSound("move");
        break;

      case "rotate":
        if (piece.tryRotateAntiClockwise()) GameManager.playSound("rotate");
        break;

      case "hold":
        GameManager.pieceHolder.hold();
        GameManager.playSound("hold");
        break;

      case "drop": {
        let dropHeight = 0;

        while (piece.tryMoveDown()) {
          dropHeight++;
        }

        if (dropHeight > 0) {
          GameManager.score.addDropBonus(dropHeight);
          GameManager.playSound("drop");
        }
        break;
      }
    }
  }

  onKeyDown(event) {
    if (!GameManager.gameStarted || !GameManager.arena) return;

    const keyActions = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowDown: "down",
      KeyS: "down",
      ArrowUp: "rotate",
      KeyW: "rotate",
      KeyR: "hold",
      Space: "drop",
      Escape: "pause",
    };

    const action = keyActions[event.code];
    if (!action) return;

    if (event.code.startsWith("Arrow") || event.code === "Space") {
      event.preventDefault();
    }

    this.performAction(action);
  }
}