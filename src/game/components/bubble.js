import BaseShape from "./shared/base-shape";
import { randomNumber } from "../utils/math";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../utils/variables";

export const MAX_LIFE_TIME = 20;

export function newBubble(eventEmitter, x = undefined, y = undefined, w = undefined, h = undefined) {
  x = x ? x : randomNumber(SCREEN_WIDTH);
  y = y ? y : randomNumber(SCREEN_HEIGHT);
  const width = w ? w : randomNumber(40, 10);
  const height = h ? h : randomNumber(40, 10);
  return new Bubble(eventEmitter, x, y, width, height);
}

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
    context.ellipse(this.x, this.y, w, h, 0, 0, Math.PI * 2);
    context.fill();
  }

  calculateScale() {
    this.scaleShape = Math.sin(this.y / 10);
  }

  getTimeFactor() {
    return Math.min(this.lifeTime / MAX_LIFE_TIME, 1);
  }

  showAndHideFunction(time) {
    return Math.sin(time * Math.PI) / 4;
  }

  growBubbleFunction(time) {
    return Math.log(time + 1) * 1.4426950408889634;
  }

  bubbleDead() {
    return this.lifeTime > MAX_LIFE_TIME;
  }
}
