import BaseShape from "./shared/base-shape";
import hole from "../shapes/hole.json";

export default class Hole extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   */
  constructor(eventEmitter, x = 0, y = 0) {
    super(eventEmitter, x, y, 0, 0);

    this.directionVector = { x: 0, y: 1 };
    this.shape = { ...hole };
    this.scaleShape = 1.7;
  }

  getPosition() {
    return { x: this.x - 8, y: this.y + 10 };
  }

  currentShape() {
    return this.shape;
  }
}
