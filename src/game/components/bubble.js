import BaseShape from "./shared/base-shape";

const ROUND_RECT_CORNER = 5;
const MAX_LIFE_TIME = 20;

export default class Bubble extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width
   * @param height
   */
  constructor(eventEmitter, x = 0, y = 0, width = 0, height = 0) {
    super(eventEmitter, x, y, width, height);

    this.scaleShape = 0;
    this.lifeTime = 0;
  }

  render(context) {
    this.calculateScale();
    this.lifeTime++;

    context.beginPath();
    context.fillStyle = this.getColorWithOpacity("#6c8d8eff", this.showAndHideFunction(this.getTimeFactor()));
    this.scaleShape = this.growBubbleFunction(this.getTimeFactor());
    const w = this.width * this.scaleShape;
    const h = this.height * this.scaleShape;
    context.roundRect(this.x - w * .5, this.y - h * .5, w, h, ROUND_RECT_CORNER);
    context.fill();
  }

  calculateScale() {
    this.scaleShape = Math.sin(this.y / 10);
  }

  getTimeFactor() {
    return Math.min(this.lifeTime / MAX_LIFE_TIME, 1);
  }

  showAndHideFunction(time) {
    // toDo (gonzalezext)[21.04.24]: check if this function can be optimized
    return Math.sin(time * Math.PI) / 1.5;
  }

  growBubbleFunction(time) {
    // todo (gonzalezext)[21.04.24]: check if this function can be optimized
    return Math.log(time + 1) * 1.4426950408889634;
  }

  bubbleDead() {
    return this.lifeTime > MAX_LIFE_TIME;
  }

  animate() {
    // toDo (gonzalezext)[19.04.24]: maybe we can animate the leafs
  }
}
