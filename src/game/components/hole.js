import BaseShape from "./shared/base-shape";
import hole from "../shapes/hole.json";
import { SCREEN_HEIGHT } from "../utils/variables";

export default class Hole extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param gridSize {number}
   */
  constructor(eventEmitter, x = 0, y = 0, gridSize) {
    super(eventEmitter, x, y, gridSize, gridSize);

    this.directionVector = { x: 0, y: 1 };
    this.shape = { ...hole };
    this.scaleShape = 1.7 * gridSize / 85;
  }

  getPosition() {
    return { x: this.x - 8, y: this.y + 10 };
  }

  currentShape() {
    return this.shape;
  }
}
