import BaseShape from "./shared/base-shape";
import cameraShape from "../shapes/camera.json";
import { distanceNoSqrt, getVector, rotateVector, scale, square, vectorToAngle } from "../utils/math";

/**
 * <b>viewDistance</b> <i>{number}</i> fraction of grid size<br>
 * <b>viewAngle</b> <i>{number}</i> fraction of PI<br>
 * <b>initialRotation</b> <i>{number}</i> fraction of PI<br>
 * <b>maxRotation</b> <i>{number}</i> fraction of PI<br>
 * <b>animationDelay</b> <i>{number}</i> in milliseconds<br>
 * <b>animateDistance</b> <i>{boolean}</i><br>
 *
 * @type {{animationDelay: number, initialRotation: number, maxRotation: number, viewAngle: number, viewDistance: number, animateDistance: boolean}}
 */
const defaultOptions = {
  viewDistance: 2,
  viewAngle: 3,
  initialRotation: 1,
  maxRotation: 2,
  animationDelay: 0,
  animateDistance: false,
  speed: 1000
};

export default class Camera extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param gridSize {number}
   * @param options {{animationDelay: number, initialRotation: number, maxRotation: number, viewAngle: number, viewDistance: number, animateDistance: boolean}}
   */
  constructor(eventEmitter, x = 0, y = 0, gridSize, options) {
    super(eventEmitter, x, y, gridSize, gridSize);

    this.options = { ...defaultOptions, ...options };

    this.baseDirection = rotateVector({ x: 0, y: 1 }, Math.PI * this.options.initialRotation);
    this.baseDistance = this.options.viewDistance;
    this.directionVector = { x: 0, y: 1 };
    this.shape = { ...cameraShape };

    const minPoint = { ...this.shape.shapes[0].points[0] };
    const maxPoint = { ...this.shape.shapes[0].points[0] };
    this.shape.shapes.forEach((shape) => shape.points.forEach((point) => {
      minPoint.x = Math.min(minPoint.x, point.x);
      minPoint.y = Math.min(minPoint.y, point.y);
      maxPoint.x = Math.max(maxPoint.x, point.x);
      maxPoint.y = Math.max(maxPoint.y, point.y);
    }));

    this.scaleShape = gridSize / Math.max(maxPoint.x - minPoint.x, maxPoint.y - minPoint.y);

    this.options.maxRotation *= Math.PI;
    this.sawPlayer = false;
  }

  animate() {
    // animate camera rotation
    const currentTime = (new Date().getTime() + this.options.animationDelay) / this.options.speed;
    const factor = Math.sin(currentTime);
    this.directionVector = rotateVector(this.baseDirection, factor * this.options.maxRotation * .5);

    // animate camera view distance
    if (this.options.animateDistance) {
      const factorDistance = (Math.sin(currentTime) + 1) * 0.5;
      this.options.viewDistance = factorDistance * this.baseDistance;
    }
  }

  render(context) {
    // render vision cone
    context.beginPath();
    const angle = this.currentViewAngle();
    context.moveTo(scale(this.x), scale(this.y));
    context.arc(
      scale(this.x),
      scale(this.y),
      scale(this.width * this.options.viewDistance),
      angle,
      angle + Math.PI / this.options.viewAngle,
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
    if (distanceNoSqrt(p, { x: this.x, y: this.y }) <= square(this.width * this.options.viewDistance)) {
      const angle = vectorToAngle(getVector({ x: this.x, y: this.y }, p));
      const halfAngle = Math.PI / (this.options.viewAngle * 2);
      const cameraAngle = this.currentViewAngle() + halfAngle;

      return Math.abs(angle - cameraAngle) < halfAngle || Math.abs(angle - cameraAngle + Math.PI * 2) < halfAngle;
    }
    return false;
  }

  currentViewAngle() {
    return vectorToAngle({
      x: -this.directionVector.x,
      y: this.directionVector.y
    }) - Math.PI / (this.options.viewAngle * 2);
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  currentShape() {
    return this.shape;
  }
}
