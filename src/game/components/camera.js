import BaseShape from "./shared/base-shape";
import cameraShape from "../shapes/camera.json";
import { distanceNoSqrt, getVector, rotateVector, scale, square, vectorToAngle } from "../utils/math";

export default class Camera extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param gridSize {number}
   * @param distance {number} number of grid cells distance
   * @param viewAngle {number} fraction of PI
   * @param initialRotation {number} fraction of PI
   * @param maxRotation {number} fraction of PI
   * @param animationDelay {number} in milliseconds
   */
  constructor(eventEmitter, x = 0, y = 0, gridSize, distance, viewAngle, initialRotation, maxRotation = 1, animationDelay) {
    super(eventEmitter, x, y, gridSize, gridSize);

    this.baseDirection = rotateVector({ x: 0, y: 1 }, Math.PI * initialRotation);
    this.directionVector = { x: 0, y: 1 };
    this.shape = { ...cameraShape };
    this.distance = distance;
    this.animationDelay = animationDelay || 0;

    const minPoint = { ...this.shape.shapes[0].points[0] };
    const maxPoint = { ...this.shape.shapes[0].points[0] };
    this.shape.shapes.forEach((shape) => shape.points.forEach((point) => {
      minPoint.x = Math.min(minPoint.x, point.x);
      minPoint.y = Math.min(minPoint.y, point.y);
      maxPoint.x = Math.max(maxPoint.x, point.x);
      maxPoint.y = Math.max(maxPoint.y, point.y);
    }));

    this.scaleShape = gridSize / Math.max(maxPoint.x - minPoint.x, maxPoint.y - minPoint.y);

    this.maxRotation = Math.PI * maxRotation;
    this.initialTime = new Date().getTime();
    this.viewAngle = viewAngle;
    this.sawPlayer = false;
  }

  animate() {
    const currentTime = (this.initialTime - new Date().getTime() + this.animationDelay) / 1000;
    const factor = Math.sin(currentTime);

    this.directionVector = rotateVector(this.baseDirection, factor * this.maxRotation * .5);
  }

  render(context) {
    // render vision cone
    context.beginPath();
    const angle = this.currentViewAngle();
    context.moveTo(scale(this.x), scale(this.y));
    context.arc(
      scale(this.x),
      scale(this.y),
      scale(this.width * this.distance),
      angle,
      angle + Math.PI / this.viewAngle,
      false);
    context.fillStyle = this.getVisionColor();
    context.fill();

    // render camera
    super.render(context);
  }

  getVisionColor() {
    if (this.sawPlayer) {
      return "rgba(255, 0, 0, 0.1)";
    }
    return "rgba(0, 255, 0, 0.1)";
  }

  seeAnyPoint(shapes) {
    for (const s of shapes) {
      for (const p of s.points) {
        if (this.seePoint(p)) {
          return true;
        }
      }
    }
    return false;
  }

  seePoint(p) {
    if (distanceNoSqrt(p, { x: this.x, y: this.y }) <= square(this.width * this.distance)) {
      const angle = vectorToAngle(getVector({ x: this.x, y: this.y }, p));
      const halfAngle = Math.PI / (this.viewAngle * 2);
      const cameraAngle = this.currentViewAngle() + halfAngle;

      return Math.abs(angle - cameraAngle) < halfAngle || Math.abs(angle - cameraAngle + Math.PI * 2) < halfAngle;
    }
    return false;
  }

  toDegree(rad) {
    return rad * 180 / Math.PI;
  }

  currentViewAngle() {
    return vectorToAngle({
      x: -this.directionVector.x,
      y: this.directionVector.y
    }) - Math.PI / (this.viewAngle * 2);
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  currentShape() {
    return this.shape;
  }
}
