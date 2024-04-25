import BaseShape from "./shared/base-shape";
import hole from "../shapes/hole.json";

export default class Hole extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param gridSize {number}
   */
  constructor(eventEmitter, x = 0, y = 0, gridSize) {
    super(eventEmitter, x, y, gridSize, gridSize);

    this.directionVector = { x: -1, y: 1 };
    this.shape = { ...hole };
    this.scaleShape = 1.7 * gridSize / 85;
  }

  render(context) {
    // animate
    this.animate();

    super.render(context);
  }

  animate() {
    super.animate();

    // update hole color light
    this.shape.shapes.filter(s => s.id === "center").forEach((shape) => {
      const opacity = (Math.sin(new Date().getTime() / 200) + 1) * 0.2 + 0.6;
      shape.background = this.getColorWithOpacity(shape.background, opacity);
    });
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  currentShape() {
    return this.shape;
  }
}
