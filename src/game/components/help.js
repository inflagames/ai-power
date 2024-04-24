import BaseObject from "./shared/base-object";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../utils/variables";
import { scale, unscale } from "../utils/math";
import Camera from "./camera";
import Hole from "./hole";
import Button from "./button";

export default class Help extends BaseObject {
  /**
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   * @param eventEmitter {Observable}
   */
  constructor(eventEmitter, x, y, width, height) {
    super(eventEmitter, x, y, width, height);
    this.backgroundColor = "#fff";

    this.padding = 10;

    this.keysSize = 40;
    this.keysTextSize = 10;
    this.keysInfoTextSize = 15;
    this.keyboardPosition = {
      x: 30,
      y: this.height * 0.5
    };

    this.enemySize = 60;
    this.enemyPosition = {
      x: x + this.width * 0.5,
      y: y + this.height * 0.5
    };
    const enemy = new Camera(
      this.eventEmitter,
      this.enemyPosition.x,
      this.enemyPosition.y,
      this.enemySize, 2, 2, 2, 0.5);

    this.winPosition = {
      x: x + width - this.padding - 110,
      y: y + height * 0.5
    };
    const winGame = new Hole(
      this.eventEmitter,
      this.winPosition.x,
      this.winPosition.y,
      70
    );

    const closeHelpButtonSize = 40;
    this.closeHelpButton = new Button(
      this.eventEmitter,
      x + width - this.padding - closeHelpButtonSize,
      y + this.padding,
      closeHelpButtonSize,
      closeHelpButtonSize,
      "x"
    );
    this.closeHelpButton.backgroundColor = "#ff000000";
    this.closeHelpButton.textColor = "#000";
    this.closeHelpButton.textSize = 20;

    this.components = [enemy, winGame, this.closeHelpButton];
  }

  destroyComponents() {
    this.components.forEach((component) => component.destroy.emit());
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render(context) {
    this.renderDialogBox(context);

    this.renderKeyboard(context, this.keyboardPosition.x, this.keyboardPosition.y);

    this.renderEnemyInfo(context, this.enemyPosition.x, this.enemyPosition.y);
    this.renderWinGameInfo(context, this.winPosition.x, this.winPosition.y);

    this.components.forEach((component) => component.animate && component.animate());
    this.components.forEach((component) => component.render(context));
  }

  renderWinGameInfo(context, x, y) {
    this.renderText(
      context,
      x - 90,
      y - 97,
      "Reach all the holes to win\nthe game",
      this.keysInfoTextSize,
      "#000"
    );
  }

  renderEnemyInfo(context, x, y) {
    this.renderText(
      context,
      x - 105,
      y - 97,
      "Avoid being seen by the camera\nor you will be killed",
      this.keysInfoTextSize,
      "#000"
    );
  }

  renderKeyboard(context, x, y) {
    const spacing = 10;
    this.renderKeyboardKey(context, x, y + spacing, "A");
    this.renderKeyboardKey(context, x + this.keysSize + this.padding, y + spacing, "S");
    this.renderKeyboardKey(context, x + this.keysSize * 2 + this.padding * 2, y + spacing, "D");
    this.renderKeyboardKey(context, x + this.keysSize + this.padding, y - this.keysSize - this.padding + spacing, "W");
    this.renderKeyboardInfo(context, x - 10, y - this.keysSize * 2 - this.padding * 3);
  }

  renderKeyboardInfo(context, x, y) {
    const xPosition = this.x + this.padding;
    const yPosition = this.y + this.padding;

    this.renderText(
      context,
      xPosition + x,
      yPosition + y,
      "Use the keyboard to move\nthe player around the map\nand avoid the cameras",
      this.keysInfoTextSize,
      "#000"
    );
  }

  /**
   * @param context
   * @param x {number}
   * @param y {number}
   * @param key {string}
   */
  renderKeyboardKey(context, x, y, key) {
    const xPosition = this.x + this.padding;
    const yPosition = this.y + this.padding;

    context.beginPath();
    context.rect(
      scale(xPosition + x),
      scale(yPosition + y),
      scale(this.keysSize),
      scale(this.keysSize)
    );
    context.fillStyle = "#000";
    context.fill();

    context.beginPath();
    context.font = `${scale(this.keysTextSize)}px Arial`;
    const metrics = context.measureText(key);
    const textWidth = unscale(metrics.width);
    const textHeight = unscale(
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    );
    context.fillStyle = "#fff";
    context.fillText(
      key,
      scale(xPosition + x + this.keysSize / 2 - textWidth / 2),
      scale(yPosition + y + this.keysSize / 2 + textHeight / 2)
    );
  }

  renderDialogBox(context) {
    context.beginPath();
    context.rect(0, 0, scale(SCREEN_WIDTH), scale(SCREEN_HEIGHT));
    context.fillStyle = "rgba(0,0,0,0.82)";
    context.fill();

    context.beginPath();
    context.rect(
      scale(this.x),
      scale(this.y),
      scale(this.width),
      scale(this.height)
    );
    context.fillStyle = this.backgroundColor;
    context.fill();
  }

  /**
   * @param context
   * @param x {number}
   * @param y {number}
   * @param text {string}
   * @param size {number}
   * @param color {string}
   */
  renderText(context, x, y, text, size, color) {
    let previousTextHeight = 0;
    const textList = text.split("\n");

    for (let t of textList) {
      context.beginPath();
      context.font = `${scale(size)}px Arial`;
      const metrics = context.measureText(size);
      // const textWidth = unscale(metrics.width);
      const textHeight = unscale(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
      context.fillStyle = color;
      context.fillText(t, scale(x), scale(y + previousTextHeight));
      previousTextHeight += textHeight + 10;
    }
  }
}
