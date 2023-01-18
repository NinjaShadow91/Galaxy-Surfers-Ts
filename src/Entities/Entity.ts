export interface EntityProps {
  id: string;
  shape: string;
  x: number;
  y: number;
  length: number;
  width: number;
  mass: number;
  health: number;
  maxHealth: number;
  fillStyle: string;
  dx: number;
  dy: number;
  dx2: number;
  dy2: number;
  image?: HTMLImageElement;
  maxVelocity: number;
  maxAccleration: number;
  xForce: number;
  yForce: number;
  coefficientOfRestitution: number;
  healthChangeStep: number;
}

export class Entity {
  _id: string;
  _shape: string;
  _x = 0;
  _y = 0;
  _length = 1;
  _width = 1;
  _mass = 1;
  _health = 1;
  _maxHealth = 100;
  _fillStyle = "black";
  _dx = 0;
  _dy = 0;
  _dx2 = 0;
  _dy2 = 0;
  _image: HTMLImageElement | null;
  _maxVelocity = 0;
  _maxAccleration = 0;
  _xForce = 0;
  _yForce = 0;
  _coeffRestitution = 0;
  _healthChangeStep = 0;
  _lastDrawData: {
    x: number;
    y: number;
    width: number;
    length: number;
    fillStyle: string;
    image: HTMLImageElement | null;
    shape: string;
  } = {
    x: 0,
    y: 0,
    width: 0,
    length: 0,
    fillStyle: "",
    image: null,
    shape: "",
  };
  #requiresNewDrawStatus: boolean = true;
  constructor(props: EntityProps) {
    this._id = props.id;
    this._shape = props.shape;
    this._x = props.x;
    this._y = props.y;
    this._length = props.length;
    this._width = props.width;
    this._mass = props.mass;
    this._health = props.health;
    this._maxHealth = props.maxHealth;
    this._fillStyle = props.fillStyle;
    this._dx = props.dx;
    this._dy = props.dy;
    this._dx2 = props.dx2;
    this._dy2 = props.dy2;
    this._image = props.image ?? null;
    this._maxVelocity = props.maxVelocity;
    this._maxAccleration = props.maxAccleration;
    this._xForce = props.xForce;
    this._yForce = props.yForce;
    this._coeffRestitution = props.coefficientOfRestitution;
    this._healthChangeStep = props.healthChangeStep;
  }

  get id() {
    return this._id;
  }
  get width() {
    return this._width;
  }

  get length() {
    return this._length;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get dx() {
    return this._dx;
  }
  get dy() {
    return this._dy;
  }

  get health() {
    return this._health;
  }

  _updatePhysicalData(data: { timeElapsed: number }) {
    this._health = this._health + this._healthChangeStep * data.timeElapsed;
    if (this._health > this._maxHealth) this._health = this._maxHealth;
    if (this._health < 0) {
      this._x = -1;
      this._y = -1;
      window.dispatchEvent(
        new CustomEvent("ENTITY_DIED", { detail: { id: this._id } })
      );
    } else {
      this._dx = this._dx + this._dx2 * data.timeElapsed;
      if (Math.abs(this._dx) > this._maxVelocity)
        this._dx = this._maxVelocity * Math.sign(this._dx);
      this._dy = this._dy + this._dy2 * data.timeElapsed;
      if (Math.abs(this._dy) > this._maxVelocity)
        this._dy = this._maxVelocity * Math.sign(this._dy);
      this._x = this._x + this._dx * data.timeElapsed;
      this._y = this._y + this._dy * data.timeElapsed;
      // this.limitPosition();
      if (!this.requireNewDraw) {
        //   this.#requireNewDraw = this.requireNewDraw();
      }
    }
  }

  update(data: { timeElapsed: number }) {
    this._updatePhysicalData(data);
  }

  limitPosition(ctx: CanvasRenderingContext2D) {
    if (this._x <= 0 && this._y <= 0) {
      this._x = 0;
      this._y = 0;
    } else if (this._x <= 0 && this._y + this._length >= ctx.canvas.height) {
      this._x = 0;
      this._y = ctx.canvas.height - this._length;
    } else if (this._x + this._width >= ctx.canvas.width && this._y <= 0) {
      this._x = ctx.canvas.width - this._width;
      this._y = 0;
    } else if (
      this._x + this._width >= ctx.canvas.width &&
      this._y + this._length >= ctx.canvas.height
    ) {
      this._x = ctx.canvas.width - this._width;
      this._y = ctx.canvas.height - this._length;
    } else if (this._x <= 0) {
      this._x = 0;
    } else if (this._x + this._width >= ctx.canvas.width) {
      this._x = ctx.canvas.width - this._width;
    } else if (this._y <= 0) {
      this._y = 0;
    } else if (this._y + this._length >= ctx.canvas.height) {
      this._y = ctx.canvas.height - this._length;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.limitPosition(ctx);
    if (this.#requiresNewDrawStatus) {
      if (this._image) {
        ctx.drawImage(this._image, this._x, this._y, this._length, this._width);
      } else {
        ctx.fillStyle = this._fillStyle;
        ctx.fillRect(this._x, this._y, this._width, this._length);
      }
      this._lastDrawData = {
        x: this._x,
        y: this._y,
        width: this._width,
        length: this._length,
        fillStyle: this._fillStyle,
        image: this._image,
        shape: this._shape,
      };
    }
  }

  requireNewDraw() {
    if (this.#requiresNewDrawStatus) return true;
    if (this._lastDrawData.x !== this._x) return true;
    if (this._lastDrawData.y !== this._y) return true;
    if (this._lastDrawData.width !== this._width) return true;
    if (this._lastDrawData.length !== this._length) return true;
    if (this._lastDrawData.fillStyle !== this._fillStyle) return true;
    if (this._lastDrawData.image !== this._image) return true;
    if (this._lastDrawData.shape !== this._shape) return true;
    return false;
  }

  moveLeft() {
    this._dx2 = (this._dx2 - this._xForce) / this._mass;
    if (Math.abs(this._dx2) > this._maxAccleration)
      this._dx2 = this._maxAccleration * Math.sign(this._dx2);
  }

  moveRight() {
    this._dx2 = (this._dx2 + this._xForce) / this._mass;
    if (Math.abs(this._dx2) > this._maxAccleration)
      this._dx2 = this._maxAccleration * Math.sign(this._dx2);
  }

  moveUp() {
    this._dy2 = (this._dy2 + this._yForce) / this._mass;
    if (Math.abs(this._dy2) > this._maxAccleration)
      this._dy2 = this._maxAccleration * Math.sign(this._dy2);
  }

  moveDown() {
    this._dy2 = (this._dy2 - this._yForce) / this._mass;
    if (Math.abs(this._dy2) > this._maxAccleration)
      this._dy2 = this._maxAccleration * Math.sign(this._dy2);
  }

  getPhysicalShapeInfo() {
    return {
      shape: this._shape,
      x: this._x,
      y: this._y,
      length: this._width,
      width: this._width,
    };
  }

  get Health() {
    return this._health;
  }

  set health(health: number) {
    this._health = health;
  }

  getId() {
    return this._id;
  }
}

export interface MainEntityProps {
  id: string;
  shape: string;
  x: number;
  y: number;
  width: number;
  length: number;
  fillStyle: string;
  image?: HTMLImageElement;
  health: number;
  maxHealth: number;
  healthChangeStep: number;
  maxVelocity: number;
  coefficientOfRestitution: number;
}

export class MainEntity extends Entity {
  constructor(props: MainEntityProps) {
    super({
      ...props,
      mass: 1,
      xForce: 0,
      yForce: 0,
      maxAccleration: 0,
      dx2: 0,
      dy2: 0,
      dx: 0,
      dy: 0,
    });
  }

  moveLeft() {
    this._dx = -this._maxVelocity;
    this._dy = 0;
  }

  moveRight() {
    this._dx = this._maxVelocity;
    this._dy = 0;
  }

  moveUp() {
    this._dy = this._maxVelocity;
    this._dx = 0;
  }

  moveDown() {
    this._dy = -this._maxVelocity;
    this._dx = 0;
  }
}
