import BaseShape from "./shared/base-shape";
import cameraShape from "../shapes/camera.json";
import { rotateVector, vectorToAngle } from "../utils/math";

export default class Camera extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param gridSize
   * @param distance
   */
  constructor(eventEmitter, x = 0, y = 0, gridSize, distance) {
    super(eventEmitter, x, y, gridSize, gridSize);

    this.baseDirection = { x: 0, y: 1 };
    this.directionVector = { x: 0, y: 1 };
    this.shape = { ...cameraShape };
    this.distance = distance;

    const minPoint = { ...this.shape.shapes[0].points[0] };
    const maxPoint = { ...this.shape.shapes[0].points[0] };
    this.shape.shapes.forEach((shape) => shape.points.forEach((point) => {
      minPoint.x = Math.min(minPoint.x, point.x);
      minPoint.y = Math.min(minPoint.y, point.y);
      maxPoint.x = Math.max(maxPoint.x, point.x);
      maxPoint.y = Math.max(maxPoint.y, point.y);
    }));

    this.scaleShape = gridSize / Math.max(maxPoint.x - minPoint.x, maxPoint.y - minPoint.y);

    this.maxRotation = Math.PI;

    this.initialTime = new Date().getTime();
  }

  animate() {
    const currentTime = (this.initialTime - new Date().getTime()) / 1000;
    const factor = Math.sin(currentTime);

    this.directionVector = rotateVector(this.baseDirection, factor * this.maxRotation * .5);
  }

  render(context) {
    // render vision cone
    context.beginPath();
    const angle = vectorToAngle({ x: -this.directionVector.x, y: this.directionVector.y }) - Math.PI / 6;
    context.moveTo(this.x, this.y);
    context.arc(this.x, this.y, this.width * this.distance, angle, angle + Math.PI / 3, false);
    context.fillStyle = this.getVisionColor();
    context.fill();

    // render camera
    super.render(context);
  }

  getVisionColor() {
    return "rgba(0, 255, 0, 0.1)";
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  currentShape() {
    return this.shape;
  }
}
