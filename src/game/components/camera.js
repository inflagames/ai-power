import BaseShape from "./shared/base-shape";
import cameraShape from "../shapes/camera.json";

export default class Camera extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param gridSize
   */
  constructor(eventEmitter, x = 0, y = 0, gridSize) {
    super(eventEmitter, x, y, gridSize, gridSize);

    this.directionVector = { x: 0, y: 1 };
    this.shape = { ...cameraShape };

    const minPoint = { ...this.shape.shapes[0].points[0] };
    const maxPoint = { ...this.shape.shapes[0].points[0] };
    this.shape.shapes.forEach((shape) => shape.points.forEach((point) => {
      console.log(point);
      minPoint.x = Math.min(minPoint.x, point.x);
      minPoint.y = Math.min(minPoint.y, point.y);
      maxPoint.x = Math.max(maxPoint.x, point.x);
      maxPoint.y = Math.max(maxPoint.y, point.y);
    }));

    console.log(minPoint, maxPoint);

    this.scaleShape = gridSize / Math.max(maxPoint.x - minPoint.x, maxPoint.y - minPoint.y);
    console.log(Math.max(maxPoint.x - minPoint.x, maxPoint.y - minPoint.y));
    console.log(gridSize);
    console.log(this.scaleShape);
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  currentShape() {
    return this.shape;
  }
}
