import BaseShape from "./shared/base-shape";
import shapePlant from "../shapes/plant1.json";
import { rotateVector } from "../utils/math";

export default class Plant extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width
   * @param height
   */
  constructor(eventEmitter, x = 0, y = 0, width = 0, height = 0) {
    super(eventEmitter, x, y, width, height);

    const randomAngle = Math.random() * Math.PI * 2;
    this.directionVector = rotateVector({ x: 0, y: 1 }, randomAngle);
  }

  currentShape() {
    return shapePlant;
  }

  animate() {
    // toDo (gonzalezext)[19.04.24]: maybe we can animate the leafs
  }
}
