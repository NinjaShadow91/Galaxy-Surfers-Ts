import { InputHandler } from "../Input.js";
import { Menu } from "../Menu.js";
import { Player, PlayerProps } from "../Entities/Player.js";
import { Enemy, EnemyProps } from "../Entities/Enemy.js";
import { Collectable, CollectableProps } from "../Entities/Collectable.js";
import {
  EnvironmentEntity,
  EnvironmentEntityProps,
} from "../Entities/Environment.js";

export interface GameProps {
  menu: Menu;
  playerConfig: PlayerProps;
}

function getConfigWithXY(config: any, x: number, y: number) {
  return {
    ...config,
    x,
    y,
  };
}
function getConfigWithRandomXY(config: any) {
  const ret = {
    ...config,
    x: Math.random() * 2000,
    y: Math.random() * 2000,
  };
  return ret;
}

export class Game {
  _state: string = "running";
  _inputHandler!: InputHandler;
  _canvas: HTMLCanvasElement;
  _paused: boolean = false;
  // Make sure to define this in all child classes
  _pause!: () => void;
  _score: number = 0;
  _lastScore: number = 0;
  _menu: Menu;
  _player!: Player;
  _enemies: Enemy[] = [];
  _collectables: Collectable[] = [];
  _environmentEntities: EnvironmentEntity[] = [];
  _statusBar!: HTMLDivElement;
  _playerConfig: {
    id: string;
    fillStyle: string;
    x: number;
    y: number;
    width: number;
    length: number;
    shape: string;
    image?: HTMLImageElement;
    maxVelocity: number;
    health: number;
    maxHealth: number;
    coefficientOfRestitution: number;
    healthChangeStep: number;
    shottingPower: number;
    shottingPowerRegainInterval: number;
    warpPower: number;
    warpPowerRegainInterval: number;
  };
  _clockSetTimeout: number = 0;
  _nextFrameRequestAnimationFrame: number = 0;
  constructor(props: GameProps) {
    this._menu = props.menu;
    this._playerConfig = props.playerConfig;
    this._canvas = this._addCanvas();
    window.addEventListener("resize", (e) => {
      this._canvas.setAttribute(
        "height",
        `${window.innerHeight - Math.floor(0.3 * window.innerHeight)}`
      );
      this._canvas.setAttribute(
        "width",
        `${window.innerWidth - Math.floor(0.3 * window.innerHeight)}`
      );
      this.draw(this._canvas.getContext("2d")!);
    });
    window.addEventListener("GAME_PAUSED", (e) => {
      this._pause();
      this._paused = true;
    });
    window.addEventListener("GAME_RESUME", (e) => {
      if (this._state === "running") this._paused = false;
    });
    window.addEventListener("GAME_RESTART", (e) => {
      this.#reset();
    });
    window.addEventListener("GAME_STATE_WON", (e) => {
      this._state = "won";
      setTimeout(() => (this._paused = !this._paused), 100);
      this._menu.open("You won", ["restart", "musicControl"]);
    });

    this._clockSetTimeout = setInterval(() => {
      if (!this._paused) {
        this.update({ timeElapsed: 1 / 200 });
        this.detectCollision();
        this.updateEntitiesArrays();
      }
    }, 1000 / 200);

    this.nextFrame = this.nextFrame.bind(this);
    this._nextFrameRequestAnimationFrame = requestAnimationFrame(
      this.nextFrame
    );
    this.#reset();
  }

  run() {}

  destructor() {
    clearInterval(this._clockSetTimeout);
    this._canvas.remove();
    this._statusBar.remove();
  }

  #reset() {
    this._state = "running";
    this._paused = false;
    this._player = new Player(this._playerConfig);
    this._inputHandler = new InputHandler(this._player);
    this._enemies = [];
    this._collectables = [];
    this._score = 0;
    this._lastScore = 0;
    this._environmentEntities = [];
    this._drawMainBoard(this._canvas.getContext("2d")!);
    this.drawStatusBar();
    this.draw(this._canvas.getContext("2d")!);
  }

  // override this method
  _drawMainBoard(ctx: CanvasRenderingContext2D) {
    document.body.style.backgroundColor = "black";
  }

  nextFrame() {
    cancelAnimationFrame(this._nextFrameRequestAnimationFrame);
    if (!this._paused) {
      this.draw(this._canvas.getContext("2d")!);
      this.updateStatusBar();
    }
    this._nextFrameRequestAnimationFrame = requestAnimationFrame(
      this.nextFrame
    );
  }

  clock() {
    if (!this._paused) {
      this.update({ timeElapsed: 200 });
      this.detectCollision.bind(this);
      this.updateEntitiesArrays.bind(this);
    }
    this._clockSetTimeout = setTimeout(() => this.clock.bind(this), 200);
    return this._clockSetTimeout;
  }

  update(data: { timeElapsed: number }) {
    this._player.update(data);
    this._enemies.forEach((enemy) => enemy.update(data));
    this._collectables.forEach((collectable) => collectable.update(data));
    this._environmentEntities.forEach((entity) => entity.update(data));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.drawMainBoard(ctx);
    this._player.draw(ctx);
    this._enemies.forEach((enemy) => {
      enemy.draw(ctx);
    });
    this._collectables.forEach((collectable) => {
      collectable.draw(ctx);
    });
    this._environmentEntities.forEach((environmentEntity) => {
      environmentEntity.draw(ctx);
    });
  }

  drawStatusBar() {
    const statusBar = document.createElement("div");
    statusBar.setAttribute("id", "statusBar");
    statusBar.style.position = "absolute";
    statusBar.style.bottom = "0";
    statusBar.style.left = "0";
    statusBar.style.width = "100%";
    statusBar.style.height = "50px";
    statusBar.style.backgroundColor = "black";
    statusBar.style.color = "white";
    statusBar.style.fontSize = "20px";
    statusBar.style.textAlign = "center";
    statusBar.style.paddingTop = "10px";
    statusBar.style.zIndex = "1000";
    statusBar.style.marginTop = "10px";
    statusBar.style.fontFamily = "monospace";
    statusBar.textContent =
      "Score: 0   |   Health: 100   |   Warp Power:Available";
    document.body.appendChild(statusBar);
    this._statusBar = statusBar;
  }

  updateStatusBar() {
    const jumpPower = this._player.warpPowerAvailable
      ? "Available"
      : "Not Available";
    this._statusBar.textContent = `Score: ${Math.floor(
      this._score
    )}   |   Health: ${
      Math.floor(this._player.health) >= 0 ? Math.floor(this._player.health) : 0
    }   |   Warp Power:${jumpPower}`;
  }

  _playerHealthBelowZeroHandler() {
    this._state = "end";
    this._paused = true;
    this._menu.open(`You died, score: ${this._score}`, [
      "restart",
      "musicControl",
    ]);
  }

  updateEntitiesArrays() {
    if (this._player.health <= 0) {
      this._playerHealthBelowZeroHandler();
    } else {
      this._enemies = this._enemies.filter((enemy) => enemy.health > 0);
      this._collectables = this._collectables.filter(
        (collectable) => collectable.health > 0
      );
      this._environmentEntities = this._environmentEntities.filter(
        (environmentEntity) => environmentEntity.health > 0
      );
    }
  }

  drawMainBoard(ctx: CanvasRenderingContext2D) {
    document.body.style.backgroundColor = "black";
  }

  _addCanvas() {
    this._canvas = document.createElement("canvas");
    this._canvas.setAttribute(
      "height",
      `${window.innerHeight - Math.floor(0.3 * window.innerHeight)}`
    );
    this._canvas.setAttribute(
      "width",
      `${window.innerWidth - Math.floor(0.3 * window.innerHeight)}`
    );
    this._canvas.getContext("2d")!.fillStyle = "#cfcfcf";
    this._canvas
      .getContext("2d")!
      .fillRect(0, 0, window.innerWidth, window.innerHeight);
    document.body.appendChild(this._canvas);
    return this._canvas;
  }

  detectCollision() {
    const playerShape = this._player.getPhysicalShapeInfo();
    this._enemies.forEach((enemy) => {
      const enemyShape = enemy.getPhysicalShapeInfo();
      if (
        playerShape.shape === "rectangle" &&
        enemyShape.shape === "rectangle"
      ) {
        return this.detectRectangleCollision(this._player, enemy);
      } else {
        console.error("Not implemented");
      }
    });

    this._collectables.forEach((collectable) => {
      const collectableShape = collectable.getPhysicalShapeInfo();
      if (
        playerShape.shape === "rectangle" &&
        collectableShape.shape === "rectangle"
      ) {
        return this.detectRectangleCollision(this._player, collectable);
      } else {
        console.error("Not implemented");
      }
    });

    this._environmentEntities.forEach((environmentEntity) => {
      const environmentEntityShape = environmentEntity.getPhysicalShapeInfo();
      if (
        playerShape.shape === "rectangle" &&
        environmentEntityShape.shape === "rectangle"
      ) {
        return this.detectRectangleCollision(this._player, environmentEntity);
      } else {
        console.error("Not implemented");
      }
    });

    return false;
  }

  detectRectangleCollision(
    player: Player,
    otherEntity: Enemy | EnvironmentEntity | Collectable
  ) {
    if (player.health > 0 && otherEntity.health > 0) {
      const rect1 = player.getPhysicalShapeInfo();
      const rect2 = otherEntity.getPhysicalShapeInfo();
      if (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.length &&
        rect1.y + rect1.length > rect2.y
      ) {
        if (otherEntity instanceof Collectable) {
          this._score += otherEntity.value;
          otherEntity.health = 0;
          window.dispatchEvent(new Event("COLLECTABLE_COLLECTED"));
        } else if (otherEntity instanceof Enemy) {
          otherEntity.health = 0;
          player.health = player.health - otherEntity.damage;
        }
        // } else if (otherEntity instanceof EnvironmentEntity) {
        //   player.health = player.health - otherEntity.damage;
        //   player.dx = -player.dx * player.getC;
        //   player.dy = -player.dy * player.coeffRestitution;
        // }
        return true;
      } else {
        return false;
      }
    }
  }

  _createEnemies(ENEMIES_NUMBER: number, enemyConifg: EnemyProps) {
    for (let i = 0; i < ENEMIES_NUMBER; ++i) {
      this._enemies.push(new Enemy(getConfigWithRandomXY(enemyConifg)));
    }
  }

  _createCollectables(
    COLLECTABLE_NUMBER: number,
    collectableConfig: CollectableProps
  ) {
    for (let i = 0; i < COLLECTABLE_NUMBER; ++i) {
      this._collectables.push(
        new Collectable(getConfigWithRandomXY(collectableConfig))
      );
    }
  }

  _createEnvironment(
    ENVIRONMENT_NUMBER: number,
    environmentEntityConfig: EnvironmentEntityProps
  ) {
    for (let i = 0; i < ENVIRONMENT_NUMBER; ++i) {
      this._environmentEntities.push(
        new EnvironmentEntity(getConfigWithRandomXY(environmentEntityConfig))
      );
    }
  }
}
