import { Player } from "./Entities/Player.js";

export class InputHandler {
  constructor(player: Player) {
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
          player.moveLeft();
          break;
        case "ArrowRight":
        case "d":
          player.moveRight();
          break;
        case "w":
        case "ArrowUp":
          player.moveDown();
          break;
        case "s":
        case "ArrowDown":
          player.moveUp();
          break;
        case " ":
          player.jump();
          break;
        case "Escape":
          window.dispatchEvent(new Event("GAME_PAUSED"));
      }
    });
  }
}
