import BaseShape from "./shared/base-shape";
import shape from "../shapes/character.json";

export const ANIMATE_WALK = 1;

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
    this.shape = { ...shape };

    this.time = new Date().getTime();

    this.animation = 0;
    this.animationIsOn = false;

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
    if ((this.animation & ANIMATE_WALK) !== 0) {
      this.animationIsOn = true
      this.animateWalk();
    } else if (this.animationIsOn) {
      this.shape = { ...shape };
    }
  }

  animateWalk() {
    const maxMovement = -20;
    const movement = this.stepAnimationFunction() * maxMovement;
    this.shape.shapes = shape.shapes.map((shape) => {
      if (shape.id.startsWith("foot")) {
        const footMov = shape.id.endsWith("-l") ? movement : -movement;
        return {
          ...shape,
          points: shape.points.map((point) => {
            return { ...point, y: point.y + footMov };
          })
        };
      }
      return { ...shape };
    });
  }

  stepAnimationFunction() {
    const time = (new Date().getTime() - this.time) / 500;
    return Math.sin(time * Math.PI);
  }

  currentShape() {
    return this.brakedShape || this.shape;
  }
}
