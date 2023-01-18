import { MainEntity, MainEntityProps } from "./Entity.js";

export interface EnemyProps extends MainEntityProps {
  damage: number;
  timeTakenToSpawn: number;
  intelligenceLevel: number;
}

// Use the intelligence level parameter

export class Enemy extends MainEntity {
  #damage = 0;
  #aiLoopSetInteval: number;
  #spawnedFully = false;
  #intelligencelevel = 0;
  #playerData = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
  };
  constructor(props: EnemyProps) {
    super(props);
    this.#aiLoopSetInteval = setTimeout(() => this.ai(), 1000);
    this.#damage = props.damage;
    this.#intelligencelevel = props.intelligenceLevel;
    this.#spawnedFully = false;

    setTimeout(() => {
      this.#spawnedFully = true;
    }, props.timeTakenToSpawn);

    window.addEventListener("PLAYER_POSITION_UPDATE", (event) => {
      if (event instanceof CustomEvent && event.detail) {
        this.#playerData.x = event.detail.x;
        this.#playerData.y = event.detail.y;
        this.#playerData.dx = event.detail.dx;
        this.#playerData.dy = event.detail.dy;
      }
    });
  }

  update(data: { timeElapsed: number }) {
    this.ai();
    super.update(data);
  }

  destructor() {
    clearInterval(this.#aiLoopSetInteval);
  }

  get damage() {
    return this.#damage;
  }
  get spawnedFully() {
    return this.#spawnedFully;
  }

  ai() {
    if (Math.floor(this._x) - this._width > Math.floor(this.#playerData.x)) {
      this.moveLeft();
    } else if (
      Math.floor(this._x) + this._width <
      Math.floor(this.#playerData.x)
    ) {
      this.moveRight();
    } else if (
      Math.floor(this._y) - this._length >
      Math.floor(this.#playerData.y)
    ) {
      this.moveDown();
    } else if (
      Math.floor(this._y) + this._length <
      Math.floor(this.#playerData.y)
    ) {
      this.moveUp();
    }
    this.#aiLoopSetInteval = setTimeout(() => this.ai(), 1000);
  }

  aiRandom() {
    const moves = [37, 39, 38, 40];
    const x = Math.floor(Math.random() * 4);
    if (this._health > 0) {
      switch (moves[x]) {
        case 37:
          this.moveLeft();
          break;
        case 39:
          this.moveRight();
          break;
        case 38:
          this.moveDown();
          break;
        case 40:
          this.moveUp();
          break;
      }
    }
  }
}
