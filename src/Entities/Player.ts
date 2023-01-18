import { MainEntity, MainEntityProps } from "./Entity.js";

export interface PlayerProps extends MainEntityProps {
  shottingPower: number;
  shottingPowerRegainInterval: number;
  warpPower: number;
  warpPowerRegainInterval: number;
}

export class Player extends MainEntity {
  #warpPowerAvailable = true;
  #warpPower = 0;
  #warpPowerRegainInterval = 3;

  #shootingPowerAvailable = true;
  #shottingPower = 0;
  #shottingPowerRegainInterval = 3;

  constructor(props: PlayerProps) {
    super(props);
    this.#warpPower = props.warpPower;
    this.#warpPowerRegainInterval = props.warpPowerRegainInterval;
    this.#shottingPower = props.shottingPower;
    this.#shottingPowerRegainInterval = props.shottingPowerRegainInterval;
  }

  jump() {
    if (this.#warpPowerAvailable) {
      // if (this._dy) this._y = this._y + Math.sign(this._dy) * this.#warpPower;
      // if (this._dx) this._x = this._x + Math.sign(this._dx) * this.#warpPower;
      if (this._dy) this._y = this._y + Math.sign(this._dy) * this.#warpPower;
      if (this._dx) this._x = this._x + Math.sign(this._dx) * this.#warpPower;
      this.#warpPowerAvailable = false;
    }
    setTimeout(
      () => (this.#warpPowerAvailable = true),
      this.#warpPowerRegainInterval * 1000
    );
  }

  // updatePhysicalData(e: CustomEvent) {
  //   window.dispatchEvent(
  //     new CustomEvent("PLAYER_POSITION_UPDATE", {
  //       detail: { x: this._x, y: this._y, dx: this._dx, dy: this._dy },
  //     })
  //   );
  //   super._updatePhysicalData(e);
  // }

  update(data: { timeElapsed: number }) {
    super.update(data);
    window.dispatchEvent(
      new CustomEvent("PLAYER_POSITION_UPDATE", {
        detail: { x: this._x, y: this._y, dx: this._dx, dy: this._dy },
      })
    );
  }

  get shootingPower() {
    return this.#shottingPower;
  }
  get shootingPowerAvailable() {
    return this.#shootingPowerAvailable;
  }
  get warpPower() {
    return this.#warpPower;
  }
  get warpPowerAvailable() {
    return this.#warpPowerAvailable;
  }
}
