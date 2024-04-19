import BaseShape from "./shared/base-shape";
import shape from "../shapes/character.json";

export default class Player extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   */
  constructor(eventEmitter, x = 0, y = 0, width = 0, height = 0) {
    super(eventEmitter, x, y, width, height);
    /** @member {number} */
    this.rotation = Math.PI / 2;
    this.directionVector = { x: 0, y: 1 };
    this.scaleShape = 1.5;
    this.shape = shape;

    this.updateCoordinates();
  }

  /**
   * Update the coordinates of the player
   * @param x {number}
   * @param y {number}
   */
  updateCoordinates({ x, y } = {}) {
    this.x = x || this.x;
    this.y = y || this.y;
  }

  /**
   * Update the direction vector of the player
   * @param v
   */
  updateDirectionVector(v) {
    this.directionVector = v;
  }

  animate() {
    super.animate();
  }

  shipShape() {
    return this.brakedShape || this.shape;
  }
}
