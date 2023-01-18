import { Menu } from "./Menu.js";
import { PlayerProps } from "./Entities/Player.js";
import { GameModeClassic } from "./GameMode/ClassicGame.js";

const playerConfig: PlayerProps = {
  id: "player",
  fillStyle: "blue",
  x: 100,
  y: 100,
  width: 50,
  length: 50,
  image: document.getElementById("player_plane_1") as HTMLImageElement,
  shape: "rectangle",
  maxVelocity: 500,
  health: 100,
  maxHealth: 100,
  coefficientOfRestitution: 0.5,
  healthChangeStep: 5,
  shottingPower: 0,
  shottingPowerRegainInterval: 3,
  warpPower: 300,
  warpPowerRegainInterval: 3,
};

class App {
  #menu: Menu;
  #game: GameModeClassic | null = null;

  // #userdata;
  #playerConfig: PlayerProps;
  #soundState: boolean = true;
  constructor() {
    this.#addEventListeners();
    this.#menu = new Menu("mainMenu", "Main Menu", true);
    this.#menu.open("Galaxy Surfers", ["start", "musicControl"]);
    // this.#user = new User();
    this.#playerConfig = playerConfig;
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape")
        window.dispatchEvent(new Event("GAME_PAUSED"));
    });
  }

  #addEventListeners() {
    window.addEventListener("MUSIC_PLAY", (e) => {
      this.#soundState = false;
      // if (this.#menu.state) this.#menu.playSound();
      // else{
      // if (this.#game) this.#game.playSound();
      // }
      if (this.#game) this.#game.playSound();
    });

    window.addEventListener("MUSIC_PAUSE", (e) => {
      this.#soundState = true;
      // this.#menu.stopSound();
      if (this.#game) this.#game.pauseSound();
    });

    window.addEventListener("GAME_START", (e) => {
      this.#startGame();
    });
  }

  #startGame() {
    this.#menu.close();
    this.#game = new GameModeClassic({
      id: "classic",
      menu: this.#menu,
      playerConfig: this.#playerConfig,
      otherData: {
        soundState: this.#soundState,
      },
    });
    this.#game.run();
    if (this.#soundState) {
      this.#game.pauseSound();
    }
  }
}

const app = new App();
