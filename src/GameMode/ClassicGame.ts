import { Collectable, CollectableProps } from "../Entities/Collectable.js";
import { Enemy, EnemyProps } from "../Entities/Enemy.js";
import { EnvironmentEntityProps, Meteor } from "../Entities/Environment.js";
import { PlayerProps } from "../Entities/Player.js";
import { Menu } from "../Menu.js";
import { Game, GameProps } from "./BaseGameClass.js";

interface GameModeClassicProps extends GameProps {
  id: string;
  // theme: string;
  menu: Menu;
  playerConfig: PlayerProps;
  otherData: {
    soundState: boolean;
  };
}

const enemyConfig: EnemyProps = {
  id: "enemy",
  fillStyle: "red",
  x: Math.random() * 2000,
  y: Math.random() * 2000,
  width: 60,
  length: 60,
  image: document.getElementById("enemy_plane_1") as HTMLImageElement,
  shape: "rectangle",
  maxVelocity: 50,
  health: 100,
  maxHealth: 100,
  coefficientOfRestitution: 0.5,
  healthChangeStep: -10,
  damage: 25,
  timeTakenToSpawn: 2,
  intelligenceLevel: 1,
};

const meteorConfig: EnvironmentEntityProps = {
  id: "meteor",
  fillStyle: "red",
  image: document.getElementById("meteor_1") as HTMLImageElement,
  x: Math.random() * 2000,
  y: 0,
  dx: Math.random() * 5 > 2 ? -100 : 100,
  dy: 500,
  dx2: 50,
  dy2: 50,
  mass: 100,
  maxAccleration: 100,
  xForce: 0,
  yForce: 100,
  width: 50,
  length: 50,
  shape: "rectangle",
  maxVelocity: 800,
  health: 100,
  maxHealth: 100,
  coefficientOfRestitution: 0.5,
  healthChangeStep: -130,
  damage: 130,
};

const collectableConfig: CollectableProps = {
  id: "collectable",
  fillStyle: "green",
  x: Math.random() * 2000,
  y: Math.random() * 2000,
  dx: 0,
  dy: 0,
  dx2: 0,
  dy2: 0,
  mass: 1,
  maxAccleration: 0,
  xForce: 0,
  yForce: 0,
  width: 50,
  length: 50,
  image: document.getElementById("collectable_1") as HTMLImageElement,
  shape: "rectangle",
  maxVelocity: 100,
  health: 100,
  maxHealth: 100,
  coefficientOfRestitution: 0.5,
  healthChangeStep: 0,
  value: 10,
};

const superCollectableConfig: CollectableProps = {
  id: "superCollectable",
  fillStyle: "green",
  x: Math.random() * 2000,
  y: Math.random() * 2000,
  dx: 0,
  dy: 0,
  dx2: 0,
  dy2: 0,
  mass: 1,
  maxAccleration: 0,
  xForce: 0,
  yForce: 0,
  width: 100,
  length: 100,
  image: document.getElementById("super_collectable_1") as HTMLImageElement,
  shape: "rectangle",
  maxVelocity: 100,
  health: 100,
  maxHealth: 100,
  coefficientOfRestitution: 0.5,
  healthChangeStep: -10,
  value: 100,
};

const superEnemyConfig: EnemyProps = {
  id: "superEnemy",
  fillStyle: "red",
  x: Math.random() * 2000,
  y: Math.random() * 2000,
  width: 150,
  length: 150,
  image: document.getElementById("super_enemy_plane_1") as HTMLImageElement,
  shape: "rectangle",
  maxVelocity: 130,
  health: 100,
  maxHealth: 100,
  coefficientOfRestitution: 0.5,
  healthChangeStep: -10,
  damage: 100,
  timeTakenToSpawn: 2,
  intelligenceLevel: 10,
};

export class GameModeClassic extends Game {
  #normalSound: HTMLAudioElement;
  #dramaticSound: HTMLAudioElement;
  #lastMusic: string;
  #soundState: boolean;
  #superThings: boolean = false;
  #regularUpdateSetTimeout: number = 0;
  #createMetoeritesSetTimeout: number = 0;
  // dont make this private
  _mainDrawBoard: boolean = false;
  #resourceTracker: {
    backgroundImage: boolean;
    dramaticSound: boolean;
    normalSound: boolean;
    player: boolean;
    enemy: boolean;
    superEnemy: boolean;
    collectable: boolean;
    superCollectable: boolean;
  } = {
    backgroundImage: false,
    dramaticSound: false,
    normalSound: false,
    player: false,
    enemy: false,
    superEnemy: false,
    collectable: false,
    superCollectable: false,
  };

  constructor(props: GameModeClassicProps) {
    super(props);
    this.#soundState = props.otherData.soundState;
    this._pause = () => {
      this._menu.open("GAME PAUSED", ["resume", "restart", "musicControl"]);
    };
    this.#createEnemies();
    this._createCollectables(25, collectableConfig);
    this.#regularUpdateSetTimeout = setTimeout(
      () => this.#regularUpdate(),
      1000
    );
    this.#createMetoeritesSetTimeout = setTimeout(
      () => this.#createMetoerites(),
      Math.random() * 5000 + 10000
    );
    this.#normalSound = this.#initiliaseNormalSound();
    this.#dramaticSound = this.#initliaseDramaticSound();
    if (this.#soundState) this.#playNormalSound();
    this.#lastMusic = "normal";
  }

  _drawMainBoard(ctx: CanvasRenderingContext2D) {
    if (!this._mainDrawBoard) {
      document.body.style.backgroundImage = `url("./assets/environment_background_1.png")`;
      document.body.style.backgroundSize = "100% 100%";
      this._mainDrawBoard = true;
    }
  }

  #regularUpdate() {
    if (this.#superThings) {
      this.#playDramaticSound();
    } else {
      this.#playNormalSound();
    }
    if (this._collectables.length < 10) {
      this.#createCollectables();
    }
    if (this._enemies.length < 5) {
      this.#createEnemies();
    }
    if (this._score - this._lastScore > 100) {
      this._lastScore = this._score + 90;
      this.#createSuperCollectable();
      this.#createSuperEnemy();
    }
    this.#regularUpdateSetTimeout = setTimeout(
      () => this.#regularUpdate(),
      1000
    );
  }

  #createCollectables() {
    this._createCollectables(5, collectableConfig);
  }

  #createEnemies() {
    this._createEnemies(2, enemyConfig);
  }

  #createMetoerites() {
    // create a visual warning effect
    for (let i = 0; i < Math.random() * 5; ++i) {
      this._environmentEntities.push(new Meteor(meteorConfig));
    }

    this.#createMetoeritesSetTimeout = setTimeout(
      () => this.#createMetoerites(),
      Math.random() * 5000 + 10000
    );
  }

  destructor() {
    clearInterval(this.#createMetoeritesSetTimeout);
    clearInterval(this.#regularUpdateSetTimeout);
    super.destructor();
  }

  #createSuperEnemy() {
    const superEnemy = new Enemy(superEnemyConfig);
    this.#superThings = true;
    this._enemies.push(superEnemy);
  }

  #createSuperCollectable() {
    const superCollectable = new Collectable(superCollectableConfig);
    this.#superThings = true;
    this._collectables.push(superCollectable);
  }

  #initiliaseNormalSound() {
    this.#normalSound = new Audio("../assets/aurora.mp3");
    this.#normalSound.onload = () => {
      this.#resourceTracker.normalSound = true;
    };
    this.#normalSound.addEventListener(
      "ended",
      function () {
        this.currentTime = 0;
        this.play();
      },
      false
    );
    return this.#normalSound;
  }

  #initliaseDramaticSound() {
    this.#dramaticSound = new Audio("../assets/punisher.mp3");
    this.#dramaticSound.onload = () => {
      this.#resourceTracker.dramaticSound = true;
    };
    this.#dramaticSound.addEventListener(
      "ended",
      function () {
        this.currentTime = 0;
        this.play();
      },
      false
    );
    return this.#dramaticSound;
  }

  #playNormalSound() {
    if (!this.#dramaticSound.paused) {
      this.#dramaticSound.pause();
      this.#dramaticSound.addEventListener("pause", () => {
        this.#normalSound.play();
        this.#lastMusic = "normal";
      });
    } else this.#normalSound.play();
  }

  #playDramaticSound() {
    if (!this.#normalSound.paused) {
      this.#normalSound.pause();
      this.#normalSound.addEventListener("pause", () => {
        this.#dramaticSound.play();
        this.#lastMusic = "dramatic";
      });
    } else this.#dramaticSound.play();
  }
  playSound() {
    if (this.#lastMusic === "normal") this.#playNormalSound();
    else this.#playDramaticSound();
  }

  pauseSound() {
    if (this.#lastMusic === "normal") this.#normalSound.pause();
    else this.#dramaticSound.pause();
  }
}
