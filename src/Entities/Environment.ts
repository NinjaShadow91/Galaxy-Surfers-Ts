import { Entity, EntityProps } from "./Entity.js";

export interface EnvironmentEntityProps extends EntityProps {
  damage: number;
}

export class EnvironmentEntity extends Entity {
  _damage = 0;
  constructor(props: EnvironmentEntityProps) {
    super(props);
  }
  get damage() {
    return this._damage;
  }
}

export class Meteor extends EnvironmentEntity {
  constructor(props: EnvironmentEntityProps) {
    super(props);
    // this._fillStyle = "red";
    // this._y = 0;
    // this._health = 100;
    this._length = Math.random() * 100;
    this._width = Math.random() * 100;
    this._width = this._width < 50 ? 50 : this._width;
    this._length = this._length < 50 ? 50 : this._length;
    this._dx = Math.random() * 5 > 2 ? -100 : 100;
    // this._dy = 500;
    // this._maxVelocity = 800;
    // this._dx2 = 50;
    // this._dy2 = 50;
    // this._healthChangeStep = -130;
    this._damage = this.damage;
  }
}
