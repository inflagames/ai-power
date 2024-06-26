import BaseObject from "./shared/base-object";
import { scale } from "../utils/math";

export default class Score extends BaseObject {
  /**
   * @param eventEmitter {Observable}
   * @param x {number} corner coordinates
   * @param y {number} corner coordinates
   * @param text {string}
   */
  constructor(eventEmitter, x, y, text) {
    super(eventEmitter, x, y);
    this.score = 0;
    this.textSize = 20;
    this.backgroundColor = "#000";
    this.textColor = "#fff";
    this.text = text;

    this.lastTime = 0;
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render(context) {
    context.font = `${scale(this.textSize)}px Arial`;
    const text = `${this.text} ${this.score}`;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const padding = 5;

    context.beginPath();
    context.rect(
      scale(this.x - textWidth - padding * 2),
      scale(this.y),
      scale(textWidth + padding * 2),
      scale(textHeight + padding * 2)
    );
    context.fillStyle = this.backgroundColor;
    context.fill();

    context.beginPath();
    context.font = `${scale(this.textSize)}px Arial`;
    context.fillStyle = this.textColor;
    context.fillText(
      text,
      scale(this.x - textWidth - padding),
      scale(this.y + textHeight + padding)
    );
  }
}
