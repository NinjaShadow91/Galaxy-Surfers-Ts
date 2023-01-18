import { Entity, EntityProps } from "./Entity.js";

export interface CollectableProps extends EntityProps {
  value: number;
}

export class Collectable extends Entity {
  #value = 0;
  constructor(props: CollectableProps) {
    super(props);
    this.#value = props.value;
  }
  get value() {
    return this.#value;
  }
}
